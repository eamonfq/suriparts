import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] animate-slide-in">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
        {type === 'success' ? <CheckCircle size={22} /> : <XCircle size={22} />}
        <span className="text-base font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded-lg">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
