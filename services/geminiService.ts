
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import type { Character, Message, GeminiChatResponse } from '../types';

const getAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("APIキーが設定されていません。");
    }
    return new GoogleGenAI({ apiKey });
};

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image-preview';

// Helper function to convert a File to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const generateCharacterDescription = async (apiKey: string, prompt: string): Promise<string> => {
    try {
        const ai = getAiClient(apiKey);
        const result: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: `Create a detailed and engaging character description for a Japanese language learning companion based on this prompt: "${prompt}". The description should give them a distinct personality, hobbies, and a backstory. The character lives in Japan. Write the description in English.`,
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        return result.text;
    } catch (error) {
        console.error("Error generating character description:", error);
        return "Failed to generate description. Please try again.";
    }
};

export const generateCharacterAvatar = async (apiKey: string, prompt: string): Promise<string> => {
    try {
        const ai = getAiClient(apiKey);
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: {
                parts: [{ text: `Generate an anime-style character avatar based on this description: ${prompt}. The image should be a close-up portrait with a simple background.` }]
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return imagePart.inlineData.data;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating character avatar:", error);
        throw new Error("Failed to generate avatar. Please try a different prompt.");
    }
};

export const getChatResponse = async (
    apiKey: string,
    character: Character,
    chatHistory: Message[],
    userMessages: Message[]
): Promise<GeminiChatResponse> => {
    const systemPrompt = `
You are an AI character in a Japanese language learning app. Your personality is defined by: "${character.description}".
You are chatting with a user who is learning Japanese. Your goal is to have a natural, engaging conversation while helping them learn.

You MUST respond in a valid JSON format. Do not add any text or markdown formatting outside the JSON object. The JSON object must adhere to this exact structure:
{
  "corrections": [
    {
      "userMessageIndex": 0,
      "isCorrect": true,
      "feedback": "完璧！すごいね！",
      "correctedText": "ユーザーのメッセージ"
    }
  ],
  "responses": [
    {
      "type": "text",
      "content": [
        { "word": "今日", "reading": null, "meaning": null },
        { "word": "は", "reading": null, "meaning": null },
        { "word": "いい", "reading": null, "meaning": null },
        { "word": "天気", "reading": "てんき", "meaning": "晴れとか雨とか、空の様子のこと" },
        { "word": "だね", "reading": null, "meaning": null }
      ]
    }
  ]
}

- For each user message in this turn, provide a corresponding object in the "corrections" array. userMessageIndex must match the message's index in the user's turn.
- Your feedback must be in VERY SIMPLE, encouraging, and almost childish Japanese.
- Your own response in "responses" should be natural and continue the conversation, in character.
- Break down EVERY Japanese word in your text response into the "content" array structure.
- For each word, determine if it is at or above the JLPT N3 level of difficulty.
- If the word is N3 or higher, you MUST provide its 'reading' (furigana) and a 'meaning' (a very simple explanation in Japanese).
- If the word is below N3 level (e.g., N4, N5, particles, hiragana-only common words), you MUST set both 'reading' and 'meaning' to null. This is very important.
- You can have multiple text response objects in the "responses" array to simulate sending several short messages.
- You can optionally include an image_prompt in "responses" to show the user something from your character's life. The prompt must be in English for an image generator.
- Example image_prompt: { "type": "image_prompt", "content": "A selfie of ${character.name} with pigtails, eating a crepe in Harajuku, anime style." }
`;

    const historyForPrompt = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: msg.parts.map(p => ({ text: p.type === 'text' ? p.content.map(w => w.word).join('') : '[IMAGE]' }))
    }));

    const userTurnContent = userMessages.flatMap(msg => msg.parts.map(p => {
        if (p.type === 'text') {
            return { text: p.content.map(w => w.word).join('') };
        }
        return { inlineData: { mimeType: 'image/jpeg', data: p.content } };
    }));
    
    try {
        const ai = getAiClient(apiKey);
        const result = await ai.models.generateContent({
            model: textModel,
            contents: { role: 'user', parts: userTurnContent },
            config: {
                systemInstruction: systemPrompt,
                thinkingConfig: { thinkingBudget: 0 },
                responseMimeType: 'application/json'
            }
        });

        // The API should return a JSON string, let's parse it.
        const jsonText = result.text.trim();
        return JSON.parse(jsonText) as GeminiChatResponse;

    } catch (error) {
        console.error("Error getting chat response:", error);
        // Throw a new error to be handled by the UI component
        throw new Error("AIとの通信に失敗しました。APIキーが正しいか確認するか、ネットワーク接続を確認してもう一度お試しください。");
    }
};

export const generateInChatImage = async (apiKey: string, prompt: string, characterAvatar: string): Promise<string> => {
    try {
        const ai = getAiClient(apiKey);
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: {
                parts: [
                    { inlineData: { data: characterAvatar, mimeType: 'image/png' } },
                    { text: `The character in the provided image is the main subject. Create a new anime-style image based on this prompt: "${prompt}". The character's appearance MUST be consistent with the provided image.` }
                ]
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return imagePart.inlineData.data;
        }
        throw new Error("No image was generated from the chat prompt.");
    } catch (error) {
        console.error("Error generating in-chat image:", error);
        throw new Error("Failed to generate the image for the chat.");
    }
};