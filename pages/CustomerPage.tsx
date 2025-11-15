
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMode, MessageAuthor, ChatMessage, MessagePart, GroundingChunk } from '../types';
import { generateStandardResponse, generateAdvancedResponse, transcribeAudio, textToSpeech, generateGroundedResponse, connectLive, summarizeSearchResults } from '../services/geminiService';
import { ThemeContext } from '../contexts/ThemeContext';
import { fileToBase64 } from '../utils/fileUtils';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import ModeSelector from '../components/ModeSelector';
import VoiceUI from '../components/VoiceUI';
import { playAudio } from '../utils/audioUtils';
import { LiveServerMessage } from '@google/genai';
import SearchResults from '../components/SearchResults';

// FIX: Infer LiveSession type from the connectLive function return type, as it's not exported from the SDK.
type LiveSession = Awaited<ReturnType<typeof connectLive>>;

const SESSION_ID = `stanley-chat-${Date.now()}`;

const CustomerPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            author: MessageAuthor.BOT,
            parts: [{ type: 'text', content: "Welcome to Stanley's Cafeteria! How can I help you today?" }],
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<ChatMode>(ChatMode.STANDARD);
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    // Voice Mode State
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
    const [transcriptions, setTranscriptions] = useState<{user: string, bot: string}>({user: '', bot: ''});
    const liveSessionPromiseRef = useRef<ReturnType<typeof connectLive> | null>(null);

    // Search State
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
    const [searchSummary, setSearchSummary] = useState('');
    const [isSearchLoading, setIsSearchLoading] = useState(false);


    const { theme, toggleTheme } = React.useContext(ThemeContext);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Create AudioContext only on the client-side
        if (typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return () => {
            audioContextRef.current?.close();
        };
    }, []);
    
    const addMessage = (author: MessageAuthor, parts: MessagePart[]) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            author,
            parts,
            timestamp: new Date().toLocaleTimeString(),
        }]);
    };

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() && !attachedFile) return;

        setIsLoading(true);
        const userParts: MessagePart[] = [];
        if (messageText.trim()) {
            userParts.push({ type: 'text', content: messageText });
        }
        if (attachedFile) {
            const base64 = await fileToBase64(attachedFile);
            userParts.push({ type: 'image', content: base64 });
        }
        addMessage(MessageAuthor.USER, userParts);
        setInput('');
        setAttachedFile(null);

        try {
            let response;
            const imagePartsApi = attachedFile ? [{ inlineData: { mimeType: attachedFile.type, data: (await fileToBase64(attachedFile)).split(',')[1] } }] : [];

            // Check for grounding trigger
            if (messageText.toLowerCase().includes('nearby') || messageText.toLowerCase().includes('around here')) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    response = await generateGroundedResponse(messageText, { latitude, longitude });
                    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
                    const responseText = response.text;
                    const botParts: MessagePart[] = [{ type: 'text', content: responseText }];
                    if(groundingChunks.length > 0){
                        botParts.push({type: 'grounding', content: '', meta: groundingChunks});
                    }
                    addMessage(MessageAuthor.BOT, botParts);
                    setIsLoading(false);
                }, (error) => {
                    console.error("Geolocation error:", error);
                    addMessage(MessageAuthor.SYSTEM, [{type: 'text', content: "Could not get your location for nearby search."}]);
                    setIsLoading(false);
                });
                return;
            }


            switch (mode) {
                case ChatMode.THINKING:
                    response = await generateAdvancedResponse(messages, messageText, imagePartsApi, 'gemini-2.5-pro', true);
                    break;
                case ChatMode.FAST:
                    response = await generateAdvancedResponse(messages, messageText, imagePartsApi, 'gemini-2.5-flash-lite', false);
                    break;
                case ChatMode.STANDARD:
                default:
                    response = await generateStandardResponse(messages, messageText, imagePartsApi, SESSION_ID);
                    break;
            }
            
            const responseText = response.text;
            addMessage(MessageAuthor.BOT, [{ type: 'text', content: responseText }]);

        } catch (error) {
            console.error('Error sending message:', error);
            addMessage(MessageAuthor.SYSTEM, [{ type: 'text', content: 'Sorry, I encountered an error.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const base64 = (await fileToBase64(audioBlob)).split(',')[1];
                    setIsLoading(true);
                    try {
                        const response = await transcribeAudio(base64);
                        const transcription = response.text;
                        setInput(prev => prev ? `${prev} ${transcription}` : transcription);
                    } catch (error) {
                        console.error("Transcription error:", error);
                        addMessage(MessageAuthor.SYSTEM, [{type: 'text', content: 'Error transcribing audio.'}]);
                    } finally {
                        setIsLoading(false);
                    }
                     stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Error accessing microphone:", error);
                addMessage(MessageAuthor.SYSTEM, [{type: 'text', content: 'Microphone access denied.'}]);
            }
        }
    };
    
    const handlePlayAudio = async (text: string) => {
        if (!audioContextRef.current) return;
        setIsLoading(true);
        try {
            const audio = await textToSpeech(text);
            if (audio) {
                await playAudio(audio, audioContextRef.current);
            }
        } catch (error) {
            console.error('TTS error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startVoiceMode = async () => {
       if (!audioContextRef.current) return;

       setIsVoiceMode(true);
       setMode(ChatMode.VOICE);
       
       let currentInput = "";
       let currentOutput = "";

       const callbacks = {
          onopen: () => console.log('Live session opened'),
          onmessage: (message: LiveServerMessage) => {
              if (message.serverContent?.inputTranscription) {
                  currentInput += message.serverContent.inputTranscription.text;
                  setTranscriptions({user: currentInput, bot: currentOutput});
              }
              if (message.serverContent?.outputTranscription) {
                  currentOutput += message.serverContent.outputTranscription.text;
                  setTranscriptions({user: currentInput, bot: currentOutput});
              }
              if (message.serverContent?.turnComplete) {
                  addMessage(MessageAuthor.USER, [{type: 'text', content: currentInput}]);
                  addMessage(MessageAuthor.BOT, [{type: 'text', content: currentOutput}]);
                  currentInput = "";
                  currentOutput = "";
                  setTranscriptions({user: '', bot: ''});
              }
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio && audioContextRef.current) {
                  playAudio(audio, audioContextRef.current);
              }
          },
          onerror: (e: ErrorEvent) => {
              console.error("Live session error:", e);
              addMessage(MessageAuthor.SYSTEM, [{type: 'text', content: 'Voice connection error.'}]);
              stopVoiceMode();
          },
          onclose: (e: CloseEvent) => {
              console.log('Live session closed');
              stopVoiceMode();
          }
       };

       liveSessionPromiseRef.current = connectLive(callbacks);
       const session = await liveSessionPromiseRef.current;
       setLiveSession(session);
    };

    const stopVoiceMode = () => {
        liveSession?.close();
        setLiveSession(null);
        liveSessionPromiseRef.current = null;
        setIsVoiceMode(false);
        setMode(ChatMode.STANDARD);
        setTranscriptions({user: '', bot: ''});
    };


    const handleModeChange = (newMode: ChatMode) => {
        if (newMode === ChatMode.VOICE) {
            startVoiceMode();
        } else {
            if(isVoiceMode) stopVoiceMode();
            setMode(newMode);
        }
    };

    const handleToggleSearch = () => {
        setIsSearching(prev => !prev);
        if (isSearching) {
            setSearchQuery('');
            setSearchResults([]);
            setSearchSummary('');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearchLoading(true);
        setSearchSummary('');
        setSearchResults([]);

        try {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const matchingMessages = messages.filter(msg => 
                msg.parts.some(part => 
                    part.type === 'text' && part.content.toLowerCase().includes(lowerCaseQuery)
                )
            );
            setSearchResults(matchingMessages);

            const summary = await summarizeSearchResults(searchQuery, matchingMessages);
            setSearchSummary(summary);
        } catch (error) {
            console.error("Search error:", error);
            setSearchSummary("Sorry, an error occurred while searching.");
        } finally {
            setIsSearchLoading(false);
        }
    };


    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white dark:bg-whatsapp-bg shadow-2xl">
            <ChatHeader 
                onThemeToggle={toggleTheme} 
                currentTheme={theme}
                isSearching={isSearching}
                onToggleSearch={handleToggleSearch}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
            />
            {isSearching ? (
                <SearchResults 
                    query={searchQuery}
                    summary={searchSummary}
                    results={searchResults}
                    isLoading={isSearchLoading}
                />
            ) : (
                <MessageList messages={messages} onPlayAudio={handlePlayAudio} />
            )}
            
            {isVoiceMode ? (
                <VoiceUI
                    transcriptions={transcriptions}
                    onStop={stopVoiceMode}
                    sessionPromise={liveSessionPromiseRef.current}
                />
            ) : !isSearching && (
                <>
                    <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
                    <ChatInput
                        input={input}
                        setInput={setInput}
                        isRecording={isRecording}
                        isLoading={isLoading}
                        attachedFile={attachedFile}
                        setAttachedFile={setAttachedFile}
                        onSendMessage={() => handleSendMessage(input)}
                        onMicClick={handleMicClick}
                    />
                </>
            )}
        </div>
    );
};

export default CustomerPage;
