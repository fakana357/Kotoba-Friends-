
import React from 'react';
import type { Character } from '../types';
import { TrashIcon, PencilIcon } from './icons';

interface CharacterListProps {
  characters: Character[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ characters, onSelect, onDelete, onEdit }) => {
    if (characters.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-base-200 rounded-lg border border-base-300">
                <h3 className="text-xl font-semibold text-base-content">まだフレンズがいません！</h3>
                <p className="text-base-content/70 mt-2">「新しいフレンズ」をクリックして、最初の学習パートナーを作りましょう。</p>
            </div>
        )
    }

  return (
    <div className="flex flex-col gap-4">
      {characters.map((char) => (
        <div 
          key={char.id} 
          className="bg-base-200 rounded-xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300 border border-base-300/50 flex items-center p-4 gap-4"
        >
            <div 
                className="flex items-center gap-4 flex-grow cursor-pointer overflow-hidden" 
                onClick={() => onSelect(char.id)}
            >
                <img 
                src={`data:image/png;base64,${char.avatar}`} 
                alt={char.name} 
                className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-base-300" 
                />
                <div className="flex-1 overflow-hidden">
                <h3 className="text-lg font-bold text-base-content truncate">{char.name}</h3>
                <p className="text-sm text-base-content/70 truncate">
                    {char.chatHistory.length > 0
                    ? char.chatHistory[char.chatHistory.length - 1].parts.map(p => p.type === 'text' ? p.content.map(w => w.word).join('') : '[画像]').join(' ')
                    : '会話を始めよう！'}
                </p>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(char.id); }}
                    className="p-2 rounded-full bg-blue-500/80 text-white hover:bg-blue-600 transition-colors"
                    aria-label={`${char.name}を編集`}
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
                    className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                    aria-label={`${char.name}を削除`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterList;
