import { createPcmBlob } from '../utils/audioUtils';
import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff } from 'lucide-react';
// FIX: Import connectLive to infer the session type, as LiveSession is not exported from the SDK.
import type { connectLive } from '../services/geminiService';

type LiveSessionPromise = ReturnType<typeof connectLive>;


interface VoiceUIProps {
    transcriptions: { user: string; bot: string };
    onStop: () => void;
    sessionPromise: LiveSessionPromise | null;
}

const VoiceUI: React.FC<VoiceUIProps> = ({ transcriptions, onStop, sessionPromise }) => {
    const [status, setStatus] = useState('Connecting...');
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    useEffect(() => {
        const startMicrophone = async () => {
            if (!sessionPromise) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

                scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    
                    // CRITICAL: Rely on sessionPromise to send data
                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(err => {
                        console.error("Error sending audio data", err);
                    });
                };
                
                sourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(audioContextRef.current.destination);

                setStatus('Connected. Speak now...');
            } catch (error) {
                console.error("Error setting up microphone for live session:", error);
                setStatus('Microphone Error');
            }
        };

        startMicrophone();

        return () => {
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            sourceRef.current?.disconnect();
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionPromise]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-800 text-white">
            <div className="w-32 h-32 rounded-full bg-whatsapp-teal/30 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-whatsapp-teal/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-whatsapp-teal"></div>
                </div>
            </div>

            <p className="mt-4 text-gray-400 text-sm">{status}</p>

            <div className="w-full mt-8 p-4 bg-black/20 rounded-lg h-32 overflow-y-auto">
                <p className="text-lg"><strong className="text-green-400">You:</strong> {transcriptions.user}</p>
                <p className="text-lg"><strong className="text-blue-400">Stanley:</strong> {transcriptions.bot}</p>
            </div>

            <button
                onClick={onStop}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold transition-colors"
            >
                <PhoneOff size={20} />
                End Call
            </button>
        </div>
    );
};

export default VoiceUI;