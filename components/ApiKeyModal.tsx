import React, { useState } from 'react';
import Button from './Button.tsx';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
  onClose: () => void;
  currentKey?: string;
  isDismissible: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, currentKey = '', isDismissible }) => {
  const [key, setKey] = useState(currentKey || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
      onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={isDismissible ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-base-200 rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in border border-base-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="p-4 flex justify-between items-center border-b border-base-300">
            <h2 id="modal-title" className="text-xl font-bold text-base-content">Google AI APIキーが必要です</h2>
        </header>
        <main className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4 font-jp">
                <p className="text-base-content/80">
                    このアプリを使用するには、Google AI StudioのAPIキーが必要です。以下のリンクからキーを取得し、入力してください。キーはデバイスに保存され、エクスポートデータに含まれます。
                </p>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                    APIキーを取得する →
                </a>
                <div>
                  <label htmlFor="api-key-input" className="block text-sm font-medium text-base-content/80 mb-1">あなたのAPIキー</label>
                  <input
                      id="api-key-input"
                      type="password"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="APIキーをここに貼り付け"
                      className="input-base w-full"
                      required
                  />
                </div>
                <div className="flex justify-end gap-2">
                    {isDismissible && <Button type="button" onClick={onClose} variant="ghost">キャンセル</Button>}
                    <Button type="submit" variant="primary" disabled={!key.trim()}>
                        キーを保存
                    </Button>
                </div>
            </form>
        </main>
      </div>
    </div>
  );
};

// To make tailwind recognize the class
const inputBase = "bg-base-100 border border-base-300 text-base-content rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 transition-colors";
const _ = <input className={inputBase}/>;

export default ApiKeyModal;