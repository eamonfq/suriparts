import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import PartDetail from './pages/PartDetail';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import QuoteForm from './pages/QuoteForm';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Suppliers from './pages/Suppliers';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 max-w-5xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:id" element={<PartDetail />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/new" element={<QuoteForm />} />
            <Route path="/quotes/:id" element={<QuoteDetail />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Routes>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
