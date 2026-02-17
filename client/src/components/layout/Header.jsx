import { Search, Bell, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuToggle }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <Menu size={24} className="text-navy-700" />
        </button>

        <div className="hidden lg:flex items-center gap-3">
          <img
            src="https://suriparts.com/wp-content/uploads/2025/04/cropped-suriparts-logo_Mesa-de-trabajo-1-scaled.png.webp"
            alt="SuriParts"
            className="h-9"
          />
        </div>

        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Part Number..."
              className="input pl-10 py-2.5 text-base"
            />
          </div>
        </form>

        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell size={22} className="text-navy-600" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
