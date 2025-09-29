
import React, { useState } from 'react';
import type { Character } from '../types.ts';
import { generateCharacterDescription, generateCharacterAvatar, fileToBase64 } from '../services/geminiService.ts';
import Button from './Button.tsx';
import { SparklesIcon, UploadIcon } from './icons.tsx';

interface CharacterCreatorProps {
  onCancel: () => void;
  onSave: (character: Character) => void;
  characterToEdit?: Character;
  apiKey: string;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCancel, onSave, characterToEdit, apiKey }) => {
  const isEditing = !!characterToEdit;

  const [name, setName] = useState(characterToEdit?.name || '');
  const [description, setDescription] = useState(characterToEdit?.description || '');
  const [avatar, setAvatar] = useState(characterToEdit?.avatar || '');
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [descriptionPrompt, setDescriptionPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDescription = async () => {
    if (!descriptionPrompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCharacterDescription(apiKey, descriptionPrompt);
      setDescription(result);
    } catch (e: any) {
      setError(e.message || '説明の生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateAvatar = async () => {
    if (!avatarPrompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCharacterAvatar(apiKey, avatarPrompt);
      setAvatar(result);
    } catch (e: any) {
      setError(e.message || 'アバターの生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setAvatar(base64);
      } catch (err) {
        setError('アップロードされた画像を処理できませんでした。');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !avatar) {
      setError('名前、説明、アバターは必須です。');
      return;
    }
    const characterData: Character = {
      id: isEditing ? characterToEdit.id : `char_${Date.now()}`,
      name,
      description,
      avatar,
      chatHistory: isEditing ? characterToEdit.chatHistory : [],
    };
    onSave(characterData);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-base-200 rounded-2xl shadow-2xl animate-fade-in border border-base-300/50">
      <h2 className="text-3xl font-bold mb-6 text-center text-primary">{isEditing ? 'フレンズを編集' : '新しいフレンズを作成'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-56 h-56 rounded-full bg-base-100 flex items-center justify-center overflow-hidden border-4 border-primary/50">
            {avatar ? (
              <img src={`data:image/png;base64,${avatar}`} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-base-content/60 text-sm">アバタープレビュー</span>
            )}
          </div>
          <label htmlFor="avatar-upload" className="w-full">
            <div className="w-full text-center bg-base-300 hover:bg-base-300/80 text-base-content font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                <UploadIcon className="w-5 h-5 inline-block mr-2" />
                画像をアップロード
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          <div className="w-full">
            <label htmlFor="avatarPrompt" className="block text-sm font-medium text-base-content/80 mb-1">またはAIで生成:</label>
            <div className="flex gap-2">
                <input
                id="avatarPrompt"
                type="text"
                value={avatarPrompt}
                onChange={(e) => setAvatarPrompt(e.target.value)}
                placeholder="例：銀髪で青い目の女の子"
                className="input-base flex-grow"
                disabled={isLoading}
                />
                <Button type="button" onClick={handleGenerateAvatar} isLoading={isLoading} disabled={!avatarPrompt} variant="secondary" className="flex-shrink-0">
                    <SparklesIcon className="w-5 h-5"/>
                </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-base-content/80 mb-1">名前</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：ユキ"
              className="input-base w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="descriptionPrompt" className="block text-sm font-medium text-base-content/80 mb-1">プロンプトから説明を生成:</label>
            <div className="flex gap-2">
                <input
                id="descriptionPrompt"
                type="text"
                value={descriptionPrompt}
                onChange={(e) => setDescriptionPrompt(e.target.value)}
                placeholder="例：内気な高校生アーティスト"
                className="input-base flex-grow"
                disabled={isLoading}
                />
                <Button type="button" onClick={handleGenerateDescription} isLoading={isLoading} disabled={!descriptionPrompt} variant="secondary" className="flex-shrink-0">
                    <SparklesIcon className="w-5 h-5"/>
                </Button>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-base-content/80 mb-1">キャラクターの説明</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="input-base w-full"
              placeholder="新しいフレンズの性格や趣味などを説明してください。"
              required
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="md:col-span-2">
            {error && <p className="text-error text-center my-4">{error}</p>}
            <div className="flex justify-end gap-4 mt-4">
            <Button type="button" onClick={onCancel} variant="ghost">キャンセル</Button>
            <Button type="submit" variant="primary" isLoading={isLoading} disabled={!name || !description || !avatar}>{isEditing ? '変更を保存' : 'フレンズを作成'}</Button>
            </div>
        </div>
      </form>
    </div>
  );
};

// Common input style class
const inputBase = "bg-base-100 border border-base-300 text-base-content rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 transition-colors";
const _ = <input className={inputBase}/>; // To make tailwind recognize the class

export default CharacterCreator;