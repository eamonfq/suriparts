import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirmar', danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-center py-4">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <AlertTriangle size={32} className={danger ? 'text-red-600' : 'text-yellow-600'} />
        </div>
        <p className="text-lg text-navy-700 mb-8">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-outline">
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
