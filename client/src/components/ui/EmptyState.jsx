import { SearchX } from 'lucide-react';

export default function EmptyState({ icon: Icon = SearchX, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-navy-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={32} className="text-navy-400" />
      </div>
      <h3 className="text-xl font-semibold text-navy-800 mb-2">{title}</h3>
      {message && <p className="text-navy-500 text-base max-w-md mb-6">{message}</p>}
      {action}
    </div>
  );
}
