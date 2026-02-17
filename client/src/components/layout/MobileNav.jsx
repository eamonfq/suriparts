import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, FileText, Users, Truck } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/inventory', icon: Search, label: 'Inventario' },
  { to: '/quotes', icon: FileText, label: 'Cotizaciones' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/suppliers', icon: Truck, label: 'Proveedores' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden safe-area-bottom">
      <div className="flex items-stretch">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 pt-2.5 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-accent-600' : 'text-navy-400'
              }`
            }
            end={to === '/'}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
