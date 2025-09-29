
import React, { useState, useCallback, useRef } from 'react';
import { Character, AppData } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import CharacterList from './components/CharacterList';
import CharacterCreator from './components/CharacterCreator';
import ChatView from './components/ChatView';
import { PlusIcon, UploadIcon, DownloadIcon, KeyIcon } from './components/icons';
import Button from './components/Button';
import ApiKeyModal from './components/ApiKeyModal';

// Base64 encoded images for default characters
const kentaAvatar = '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';
const aoiAvatar = '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';

const defaultCharacters: Character[] = [
    {
        id: 'default_kenta',
        name: '健太',
        avatar: kentaAvatar,
        description: '元気でスポーツ好きな高校生。休日はバスケをしたり、友達とラーメンを食べに行くのが好き。少しおっちょこちょいなところもあるけど、誰にでも優しい人気者。',
        chatHistory: [],
    },
    {
        id: 'default_aoi',
        name: '葵',
        avatar: aoiAvatar,
        description: '物静かで読書が好きな女の子。美術部に所属していて、風景画を描くのが得意。猫が好きで、近所の野良猫とよく遊んでいる。優しい心の持ち主。',
        chatHistory: [],
    }
];


const App: React.FC = () => {
  const [data, setData] = useLocalStorage<AppData>('kotoba-friends-data', { characters: defaultCharacters, apiKey: '' });
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectCharacter = (id: string) => {
    setSelectedCharacterId(id);
    setIsCreating(false);
    setEditingCharacterId(null);
  };

  const handleBack = () => {
    setSelectedCharacterId(null);
  };
  
  const handleSaveCharacter = useCallback((character: Character) => {
    setData(prevData => {
        const charExists = prevData.characters.some(c => c.id === character.id);
        if (charExists) {
            // Update existing character
            return {
                ...prevData,
                characters: prevData.characters.map(c => c.id === character.id ? character : c)
            };
        } else {
            // Add new character
            return {
                ...prevData,
                characters: [...prevData.characters, character]
            };
        }
    });
    setIsCreating(false);
    setEditingCharacterId(null);
    setSelectedCharacterId(character.id); // Go to chat view after save
  }, [setData]);
  
  const handleStartEdit = (id: string) => {
    setEditingCharacterId(id);
    setSelectedCharacterId(null);
    setIsCreating(false);
  };

  const handleCancelCreator = () => {
    setIsCreating(false);
    setEditingCharacterId(null);
  };

  const handleAddNew = () => {
      setIsCreating(true);
      setEditingCharacterId(null);
      setSelectedCharacterId(null);
  }

  const updateCharacter = useCallback((updatedCharacter: Character) => {
    setData(prevData => ({
      ...prevData,
      characters: prevData.characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c)
    }));
  }, [setData]);

  const handleDeleteCharacter = (id: string) => {
    if (window.confirm('このキャラクターを本当に削除しますか？チャットの履歴はすべて失われます。')) {
        setData(prevData => ({
            ...prevData,
            characters: prevData.characters.filter(c => c.id !== id)
        }));
        if(selectedCharacterId === id) {
            setSelectedCharacterId(null);
        }
    }
  };

  const selectedCharacter = data.characters.find(c => c.id === selectedCharacterId);
  const characterToEdit = data.characters.find(c => c.id === editingCharacterId);

  const handleDownloadData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "kotoba-friends-backup.json";
    link.click();
  };

  const handleUploadData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const parsedData = JSON.parse(text) as AppData;
          // Basic validation
          if (parsedData.characters && Array.isArray(parsedData.characters)) {
            setData(parsedData);
            alert('データが正常にインポートされました！');
          } else {
            throw new Error('Invalid data format.');
          }
        }
      } catch (error) {
        console.error("Failed to parse uploaded file:", error);
        alert('データのインポートに失敗しました。ファイルが破損しているか、形式が正しくない可能性があります。');
      }
    };
    reader.readAsText(file);
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };
  
  const handleSaveApiKey = (apiKey: string) => {
    setData(prev => ({ ...prev, apiKey }));
    setIsApiKeyModalOpen(false);
  };

  const getSortTimestamp = (char: Character): number => {
    if (char.chatHistory.length > 0) {
      return char.chatHistory[char.chatHistory.length - 1].timestamp;
    }
    const timestampFromId = parseInt(char.id.split('_')[1], 10);
    return !isNaN(timestampFromId) ? timestampFromId : 0;
  };

  const sortedCharacters = [...data.characters].sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));

  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-jp">
       {(!data.apiKey || isApiKeyModalOpen) && (
            <ApiKeyModal
                onSave={handleSaveApiKey}
                currentKey={data.apiKey}
                isDismissible={!!data.apiKey}
                onClose={() => setIsApiKeyModalOpen(false)}
            />
        )}
      <header className="bg-base-200/80 backdrop-blur-sm shadow-lg p-4 flex justify-between items-center sticky top-0 z-20 border-b border-base-300">
        <h1 className="text-2xl font-bold text-base-content tracking-wider cursor-pointer" onClick={() => { setSelectedCharacterId(null); setIsCreating(false); setEditingCharacterId(null); }}>
            <span className="text-primary">ことば</span>
            <span className="text-secondary">フレンズ</span>
        </h1>
        <div className="flex items-center gap-2">
            <Button onClick={() => setIsApiKeyModalOpen(true)} variant="ghost" size="sm">
                <KeyIcon className="w-5 h-5" />
                APIキー
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="sm">
                <UploadIcon className="w-5 h-5" />
                インポート
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleUploadData} accept=".json" className="hidden" />
            <Button onClick={handleDownloadData} variant="ghost" size="sm">
                <DownloadIcon className="w-5 h-5" />
                エクスポート
            </Button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {selectedCharacter && data.apiKey ? (
          <ChatView character={selectedCharacter} onBack={handleBack} updateCharacter={updateCharacter} apiKey={data.apiKey} />
        ) : (isCreating || characterToEdit) && data.apiKey ? (
          <CharacterCreator onCancel={handleCancelCreator} onSave={handleSaveCharacter} characterToEdit={characterToEdit} apiKey={data.apiKey} />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-base-content">あなたのフレンズ</h2>
                <Button onClick={handleAddNew} variant="primary" disabled={!data.apiKey}>
                    <PlusIcon className="w-5 h-5" />
                    新しいフレンズ
                </Button>
            </div>
            {!data.apiKey && (
                <div className="text-center py-10 px-6 bg-yellow-100/50 text-yellow-800 rounded-lg border border-yellow-300">
                    <h3 className="text-lg font-semibold">APIキーを設定してください</h3>
                    <p className="mt-2">AI機能を利用するには、右上の「APIキー」ボタンからGoogle AI APIキーを設定する必要があります。</p>
                </div>
            )}
            <CharacterList characters={sortedCharacters} onSelect={handleSelectCharacter} onDelete={handleDeleteCharacter} onEdit={handleStartEdit} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;