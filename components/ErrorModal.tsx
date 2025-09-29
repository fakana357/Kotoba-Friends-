
import React from 'react';
import Modal from './Modal';
import { XCircleIcon } from './icons';

interface ErrorModalProps {
  error: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="エラーが発生しました">
        <div className="text-center font-jp p-4">
            <XCircleIcon className="w-16 h-16 text-error mx-auto mb-4" />
            <p className="text-lg text-base-content/90">
                {error}
            </p>
        </div>
    </Modal>
  );
};

export default ErrorModal;
