import { GoogleGenAI, FunctionDeclaration, Type, Modality, GenerateContentResponse, Chat, LiveServerMessage, Part } from "@google/genai";
import { ChatMessage, MessageAuthor } from "../types";

// Ensure API key is available
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getMenuItemsFunctionDeclaration: FunctionDeclaration = {
  name: 'getMenuItems',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'The category of menu items to retrieve (e.g., "Appetizers", "Main Courses", "Desserts").',
      },
    },
  },
  description: 'Retrieves a list of menu items from a specific category.',
};

const placeOrderFunctionDeclaration: FunctionDeclaration = {
  name: 'placeOrder',
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: 'A list of items to order.',
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.INTEGER }
            }
        }
      },
      deliveryAddress: {
        type: Type.STRING,
        description: 'The address for the delivery.',
      },
    },
    required: ['items', 'deliveryAddress'],
  },
  description: 'Places a delivery order for the specified items.',
};

const MOCK_MENU = {
    "Appetizers": [{ name: "Spring Rolls", price: 5.99 }, { name: "Garlic Bread", price: 4.50 }],
    "Main Courses": [{ name: "Spaghetti Carbonara", price: 12.99 }, { name: "Margherita Pizza", price: 10.50 }],
    "Desserts": [{ name: "Tiramisu", price: 6.50 }, { name: "Chocolate Lava Cake", price: 7.00 }]
};

const chats: { [key: string]: Chat } = {};

function getChat(sessionId: string): Chat {
  if (!chats[sessionId]) {
    chats[sessionId] = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful and friendly assistant for Stanley's Cafeteria. Your goal is to help users with their questions, find menu items, and place orders. Be concise and conversational.",
        tools: [{functionDeclarations: [getMenuItemsFunctionDeclaration, placeOrderFunctionDeclaration]}]
      },
    });
  }
  return chats[sessionId];
}

async function handleFunctionCall(functionCalls: any[], sessionId: string): Promise<GenerateContentResponse | null> {
    const chat = getChat(sessionId);
    for (const call of functionCalls) {
        const { name, args } = call;
        let functionResponsePayload;

        if (name === 'getMenuItems') {
            const category = args.category as keyof typeof MOCK_MENU;
            const items = MOCK_MENU[category] || [];
            functionResponsePayload = { name, response: { result: { items } } };
        } else if (name === 'placeOrder') {
            const orderId = `ORD-${Date.now()}`;
            console.log('Order placed:', args.items, 'to', args.deliveryAddress, 'ID:', orderId);
            functionResponsePayload = { name, response: { result: { success: true, orderId, message: "Your order has been placed successfully!" } } };
        }

        if (functionResponsePayload) {
            // FIX: The `chat.sendMessage` method expects an object with a `message` property.
             const result = await chat.sendMessage({ message: [{ functionResponse: functionResponsePayload }] });
             return result;
        }
    }
    return null;
}


export const generateStandardResponse = async (history: ChatMessage[], prompt: string, imageParts: Part[], sessionId: string): Promise<GenerateContentResponse> => {
    const chat = getChat(sessionId);
    const contents: Part[] = imageParts.concat({ text: prompt });
    // FIX: The `chat.sendMessage` method expects an object with a `message` property.
    const result: GenerateContentResponse = await chat.sendMessage({ message: contents });

    if (result.functionCalls && result.functionCalls.length > 0) {
        const functionCallResult = await handleFunctionCall(result.functionCalls, sessionId);
        if (functionCallResult) return functionCallResult;
    }

    return result;
};


export const generateAdvancedResponse = async (history: ChatMessage[], prompt: string, imageParts: any[], model: 'gemini-2.5-pro' | 'gemini-2.5-flash-lite', useThinking: boolean): Promise<GenerateContentResponse> => {
    const contents = history.map(msg => ({
        role: msg.author === MessageAuthor.USER ? 'user' : 'model',
        parts: msg.parts.map(p => {
            if (p.type === 'image') return { inlineData: { mimeType: 'image/jpeg', data: p.content.split(',')[1] } };
            return { text: p.content };
        })
    }));

    contents.push({ role: 'user', parts: imageParts.concat({ text: prompt }) });
    
    return ai.models.generateContent({
        model,
        contents,
        config: useThinking ? { thinkingConfig: { thinkingBudget: 32768 } } : {}
    });
};

export const transcribeAudio = async (audioBase64: string): Promise<GenerateContentResponse> => {
    const audioPart = {
        inlineData: {
            mimeType: 'audio/webm', // MediaRecorder often produces webm
            data: audioBase64,
        },
    };
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [audioPart, { text: "Transcribe the following audio recording precisely." }],
    });
};


export const textToSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say this naturally: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio ?? null;
    } catch (error) {
        console.error("TTS Error:", error);
        return null;
    }
};

export const generateGroundedResponse = async (prompt: string, location: { latitude: number, longitude: number }): Promise<GenerateContentResponse> => {
    return ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleMaps: {}}],
            toolConfig: {
              retrievalConfig: { latLng: location }
            }
        }
    });
};

export const connectLive = async (callbacks: {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror: (e: ErrorEvent) => void;
  onclose: (e: CloseEvent) => void;
}) => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: "You are Stanley, a friendly and helpful voice assistant for Stanley's Cafeteria. Keep your responses brief and conversational.",
        },
    });
};

export const summarizeSearchResults = async (query: string, results: ChatMessage[]): Promise<string> => {
    if (results.length === 0) {
        return "No matching messages found to summarize.";
    }

    const context = results.map(msg => {
        const textParts = msg.parts.filter(p => p.type === 'text').map(p => p.content).join(' ');
        return `${msg.author === MessageAuthor.USER ? 'User' : 'Stanley'}: ${textParts}`;
    }).join('\n');

    const prompt = `A user searched their chat history for the query: "${query}".
The following messages matched their search. 
Briefly summarize the key information from these messages in one or two sentences, directly answering the user's query if possible.

Matching Messages:
${context}

Summary:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Summarization Error:", error);
        return "Could not generate a summary for the search results.";
    }
};
