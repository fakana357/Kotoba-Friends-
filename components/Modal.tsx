
import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-base-200 rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in border border-base-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="p-4 flex justify-between items-center border-b border-base-300">
            <h2 id="modal-title" className="text-xl font-bold text-base-content">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300 transition-colors" aria-label="モーダルを閉じる">
                <XIcon className="w-6 h-6"/>
            </button>
        </header>
        <main className="p-6">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;
