
import React from 'react';
import type { Correction } from '../types';
import { CheckCircleIcon, LightBulbIcon } from './icons';
import Modal from './Modal';

interface CorrectionModalProps {
  correction: Correction;
  originalText: string;
  onClose: () => void;
}

const CorrectionModal: React.FC<CorrectionModalProps> = ({ correction, originalText, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="文法レビュー">
        <div className="space-y-6 font-jp text-base-content/90">
            <div>
                <h4 className="font-semibold text-base-content/70 mb-1">あなたのメッセージ:</h4>
                <p className="bg-base-100 p-3 rounded-lg text-lg">"{originalText}"</p>
            </div>
            
            <div className="flex items-center gap-3">
                {correction.isCorrect ? <CheckCircleIcon className="w-8 h-8 text-success"/> : <LightBulbIcon className="w-8 h-8 text-warning" />}
                <p className="text-xl font-medium text-base-content">{correction.feedback}</p>
            </div>

            {!correction.isCorrect && (
                 <div>
                    <h4 className="font-semibold text-base-content/70 mb-1">提案:</h4>
                    <p className="bg-success/20 border border-success/50 p-3 rounded-lg text-lg text-base-content">"{correction.correctedText}"</p>
                </div>
            )}
        </div>
    </Modal>
  );
};

export default CorrectionModal;
