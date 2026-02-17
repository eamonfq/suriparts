import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, FileText, Users, Truck, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/inventory', icon: Search, label: 'Inventario' },
  { to: '/quotes', icon: FileText, label: 'Cotizaciones' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/suppliers', icon: Truck, label: 'Proveedores' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-navy-900 text-white z-50 w-72
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <img
              src="https://suriparts.com/wp-content/uploads/2025/04/cropped-suriparts-logo_Mesa-de-trabajo-1-scaled.png.webp"
              alt="SuriParts"
              className="h-10 brightness-0 invert"
            />
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-navy-700">
            <X size={22} />
          </button>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`
              }
              end={to === '/'}
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-700">
          <div className="text-sm text-navy-400 text-center">
            SuriParts Corp &copy; 2026
          </div>
        </div>
      </aside>
    </>
  );
}
