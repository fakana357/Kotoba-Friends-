
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Character, Message, MessageContent, WordInfo, Correction } from '../types';
import { getChatResponse, generateInChatImage, fileToBase64 } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import CorrectionModal from './CorrectionModal';
import ErrorModal from './ErrorModal';
import Button from './Button';
import { ArrowLeftIcon, PaperAirplaneIcon, PaperClipIcon, SparklesIcon } from './icons';

interface ChatViewProps {
  character: Character;
  onBack: () => void;
  updateCharacter: (character: Character) => void;
  apiKey: string;
}

const ChatView: React.FC<ChatViewProps> = ({ character, onBack, updateCharacter, apiKey }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentTurnMessages, setCurrentTurnMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [correctionToShow, setCorrectionToShow] = useState<{ message: Message, correction: Correction } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayedMessages([...character.chatHistory]);
  }, [character.chatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages, isLoading]);

  const handleSendMessage = (newMessages: Message[]) => {
    setCurrentTurnMessages(prev => [...prev, ...newMessages]);
    setDisplayedMessages(prev => [...prev, ...newMessages]);
    setCurrentText('');
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentText.trim()) return;
    const textContent: MessageContent = {
      type: 'text',
      content: [{ word: currentText, reading: null, meaning: null }],
    };
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      parts: [textContent],
      timestamp: Date.now(),
    };
    handleSendMessage([newMessage]);
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    const imageContent: MessageContent = { type: 'image', content: base64 };
    
    let parts: MessageContent[] = [imageContent];
    if (currentText.trim()) {
        parts.push({ type: 'text', content: [{ word: currentText, reading: null, meaning: null }] });
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      parts: parts,
      timestamp: Date.now(),
    };
    handleSendMessage([newMessage]);
  };

  const handleYourTurn = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    const userTurnMessagesForApi = [...currentTurnMessages];
    setCurrentTurnMessages([]); // Clear for next turn
    
    try {
        const response = await getChatResponse(apiKey, character, character.chatHistory, userTurnMessagesForApi);

        const userMessagesWithCorrections = userTurnMessagesForApi.map((msg, index) => {
            const correction = response.corrections.find(c => c.userMessageIndex === index);
            return { ...msg, correction: correction || null };
        });
        
        // Replace the local user messages with the ones that have correction data
        setDisplayedMessages(prev => {
            const historyWithoutTurn = prev.slice(0, prev.length - userTurnMessagesForApi.length);
            return [...historyWithoutTurn, ...userMessagesWithCorrections];
        });

        const aiResponses: Message[] = [];
        for (const res of response.responses) {
            let aiMessage: Message | null = null;
            if (res.type === 'text') {
                aiMessage = {
                    id: `msg_ai_${Date.now()}_${aiResponses.length}`,
                    sender: 'ai',
                    parts: [{ type: 'text', content: res.content }],
                    timestamp: Date.now(),
                };
            } else if (res.type === 'image_prompt') {
                try {
                    const imageBase64 = await generateInChatImage(apiKey, res.content, character.avatar);
                    aiMessage = {
                        id: `msg_ai_${Date.now()}_${aiResponses.length}`,
                        sender: 'ai',
                        parts: [{ type: 'image', content: imageBase64 }],
                        timestamp: Date.now(),
                    };
                } catch (e) {
                    console.error(e);
                }
            }
            if (aiMessage) {
                aiResponses.push(aiMessage);
            }
        }
        
        let cumulativeHistory = [...character.chatHistory, ...userMessagesWithCorrections];

        for (const msg of aiResponses) {
            setDisplayedMessages(prev => [...prev, msg]);
            cumulativeHistory.push(msg);
            // Persist after each AI message to prevent data loss on navigation
            updateCharacter({ ...character, chatHistory: [...cumulativeHistory] });
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));
        }
        
    } catch (err: any) {
        setApiError(err.message || '不明なエラーが発生しました。');
        // Restore user messages so they can retry
        setCurrentTurnMessages(userTurnMessagesForApi);
    } finally {
        setIsLoading(false);
    }

  }, [apiKey, character, currentTurnMessages, updateCharacter]);

  const canPressYourTurn = !isLoading && (currentTurnMessages.length > 0 || (character.chatHistory.length === 0 && currentTurnMessages.length === 0));


  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-base-200 rounded-2xl shadow-2xl animate-fade-in border border-base-300/50">
        <header className="flex items-center p-4 border-b border-base-300">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-base-300/50 transition-colors">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <img src={`data:image/png;base64,${character.avatar}`} alt={character.name} className="w-10 h-10 rounded-full object-cover ml-4" />
            <h2 className="text-xl font-bold ml-4">{character.name}</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {displayedMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onShowCorrection={(correction) => setCorrectionToShow({ message: msg, correction })} />
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="flex items-center gap-2 bg-base-300 px-4 py-2 rounded-2xl rounded-bl-lg">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>
        
        <div className="p-4 border-t border-base-300 bg-base-200 rounded-b-2xl">
            <Button
                onClick={handleYourTurn}
                disabled={!canPressYourTurn}
                isLoading={isLoading}
                variant="primary"
                className={`w-full text-lg mb-4 ${canPressYourTurn ? 'animate-pulse-glow' : ''}`}
            >
                <SparklesIcon className="w-6 h-6 mr-2" />
                {isLoading ? '考え中...' : 'あなたの番です！'}
            </Button>
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                <Button type="button" variant="ghost" className="p-2" onClick={() => fileInputRef.current?.click()}>
                    <PaperClipIcon className="w-6 h-6" />
                </Button>
                <input
                    type="text"
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder="日本語でメッセージを入力..."
                    className="flex-1 bg-base-100 border border-base-300 rounded-lg p-3 focus:ring-primary focus:border-primary transition-colors"
                    disabled={isLoading}
                />
                <Button type="submit" variant="primary" className="p-3" disabled={isLoading || !currentText.trim()}>
                    <PaperAirplaneIcon className="w-6 h-6" />
                </Button>
            </form>
        </div>
        
        {correctionToShow && (
            <CorrectionModal
                correction={correctionToShow.correction}
                originalText={correctionToShow.message.parts.map(p => p.type === 'text' ? p.content.map(w => w.word).join('') : '').join(' ')}
                onClose={() => setCorrectionToShow(null)}
            />
        )}

        {apiError && (
            <ErrorModal error={apiError} onClose={() => setApiError(null)} />
        )}
    </div>
  );
};

export default ChatView;