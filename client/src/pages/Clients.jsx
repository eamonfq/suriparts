import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Search, Plus, Users, Building, Globe, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

export default function Clients() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => api.getClients(search),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setToast({ message: 'Cliente creado exitosamente', type: 'success' });
    },
    onError: () => setToast({ message: 'Error al crear cliente', type: 'error' }),
  });

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">Clientes</h1>
        <button onClick={() => setShowForm(true)} className="btn-accent">
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, empresa o pais..."
          className="input pl-10"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner message="Cargando clientes..." />
      ) : !clients?.length ? (
        <EmptyState
          icon={Users}
          title="No hay clientes"
          message={search ? `Sin resultados para "${search}"` : 'Agrega tu primer cliente'}
          action={
            <button onClick={() => setShowForm(true)} className="btn-accent">
              <Plus size={20} /> Nuevo Cliente
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="card flex items-center gap-4 hover:shadow-md hover:border-navy-200 transition-all group"
            >
              <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center shrink-0">
                <Building size={24} className="text-navy-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-900 text-lg">{client.company || client.name}</h3>
                <p className="text-navy-600">{client.name}</p>
                <div className="flex items-center gap-3 text-sm text-navy-400 mt-1">
                  <span className="flex items-center gap-1"><Globe size={14} /> {client.country}</span>
                  {client.email && <span className="hidden sm:inline">{client.email}</span>}
                </div>
              </div>
              <ChevronRight size={20} className="text-navy-300 group-hover:text-accent-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <ClientFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
      />
    </div>
  );
}

function ClientFormModal({ open, onClose, onSubmit, loading, initialData }) {
  const [form, setForm] = useState(initialData || {
    name: '', company: '', country: '', email: '', phone: '', whatsapp: '', notes: '',
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Editar Cliente' : 'Nuevo Cliente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nombre del Contacto *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="label">Empresa</label>
          <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Pais</label>
            <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Telefono</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={3} placeholder="Notas sobre este cliente..." />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
          <button type="submit" className="btn-accent" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
