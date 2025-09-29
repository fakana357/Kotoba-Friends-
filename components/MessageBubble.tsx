
import React, { useState } from 'react';
import type { Message, WordInfo, Correction } from '../types';
import WordTooltip from './WordTooltip';
import { CheckCircleIcon, LightBulbIcon } from './icons';

interface MessageBubbleProps {
  message: Message;
  onShowCorrection: (correction: Correction) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onShowCorrection }) => {
  const [activeWord, setActiveWord] = useState<WordInfo | null>(null);
  
  const isUser = message.sender === 'user';
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isUser ? 'bg-primary' : 'bg-base-300';
  const bubbleShape = isUser ? 'rounded-br-lg' : 'rounded-bl-lg';

  return (
    <div className={`flex ${alignment} animate-fade-in`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${bubbleColor} ${bubbleShape} ${isUser ? 'text-white' : 'text-base-content'} relative`}>
        {message.parts.map((part, index) => {
            if (part.type === 'text') {
                return (
                    <p key={index} className="whitespace-pre-wrap font-jp leading-relaxed">
                        {part.content.map((wordInfo, wordIndex) => (
                        <span
                            key={wordIndex}
                            className={!isUser && wordInfo.meaning ? 'cursor-pointer text-secondary font-bold hover:underline' : ''}
                            onClick={() => wordInfo.meaning && setActiveWord(wordInfo)}
                        >
                            {wordInfo.word}
                        </span>
                        ))}
                   </p>
                )
            }
            if (part.type === 'image') {
                return (
                    <img key={index} src={`data:image/jpeg;base64,${part.content}`} alt="Chat content" className="rounded-lg max-w-full h-auto mt-2" />
                )
            }
            return null;
        })}
        {isUser && message.correction && (
            <button
                onClick={() => onShowCorrection(message.correction!)}
                className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-base-200 shadow-md border border-base-300/50 text-base-content transition-transform hover:scale-110"
            >
                {message.correction.isCorrect ? <CheckCircleIcon className="w-5 h-5 text-success" /> : <LightBulbIcon className="w-5 h-5 text-warning" />}
            </button>
        )}
      </div>
      {activeWord && <WordTooltip wordInfo={activeWord} onClose={() => setActiveWord(null)} />}
    </div>
  );
};

export default MessageBubble;
