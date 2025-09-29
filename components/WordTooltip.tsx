
import React, { useEffect, useRef } from 'react';
import type { WordInfo } from '../types';
import { XIcon } from './icons';

interface WordTooltipProps {
  wordInfo: WordInfo;
  onClose: () => void;
}

const WordTooltip: React.FC<WordTooltipProps> = ({ wordInfo, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-base-200 rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-fade-in font-jp"
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-base-300 transition-colors">
            <XIcon className="w-5 h-5"/>
        </button>
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-4xl text-primary">{wordInfo.word}</h3>
            </div>
            {wordInfo.reading && (
                <div>
                    <h4 className="font-semibold text-base-content/70 text-sm mb-1">よみかた</h4>
                    <p className="text-2xl text-secondary font-semibold">{wordInfo.reading}</p>
                </div>
            )}
            {wordInfo.meaning && (
                <div>
                    <h4 className="font-semibold text-base-content/70 text-sm mb-1">いみ</h4>
                    <p className="text-base-content/90 text-lg leading-relaxed">{wordInfo.meaning}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WordTooltip;
