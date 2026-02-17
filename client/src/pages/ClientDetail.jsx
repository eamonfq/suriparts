import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, formatDate, statusLabels, statusColors } from '../utils/format';
import { ArrowLeft, Building, Mail, Phone, MessageCircle, Globe, FileText, Edit2, StickyNote } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState(null);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.getClient(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      setShowEdit(false);
      setToast({ message: 'Cliente actualizado', type: 'success' });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!client) return <div className="text-center py-16 text-navy-500 text-lg">Cliente no encontrado</div>;

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-navy-500 hover:text-navy-700 text-base font-medium">
        <ArrowLeft size={20} />
        Volver a clientes
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-navy-100 rounded-2xl flex items-center justify-center shrink-0">
              <Building size={30} className="text-navy-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{client.company || client.name}</h1>
              <p className="text-lg text-navy-600">{client.name}</p>
            </div>
          </div>
          <button onClick={() => setShowEdit(true)} className="btn-outline btn-sm">
            <Edit2 size={18} /> Editar
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <InfoRow icon={Globe} label="Pais" value={client.country} />
          <InfoRow icon={Mail} label="Email" value={client.email} link={`mailto:${client.email}`} />
          <InfoRow icon={Phone} label="Telefono" value={client.phone} link={`tel:${client.phone}`} />
          <InfoRow icon={MessageCircle} label="WhatsApp" value={client.whatsapp} link={`https://wa.me/${client.whatsapp?.replace(/[^0-9]/g, '')}`} />
        </div>

        {client.notes && (
          <div className="p-4 bg-yellow-50 rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote size={18} className="text-yellow-700" />
              <p className="font-semibold text-yellow-800">Notas</p>
            </div>
            <p className="text-yellow-900 text-base">{client.notes}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link to={`/quotes/new`} className="btn-accent">
            <FileText size={20} /> Nueva Cotizacion
          </Link>
          <a href={`https://wa.me/${client.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-outline border-green-300 text-green-700 hover:bg-green-50">
            <MessageCircle size={20} /> WhatsApp
          </a>
        </div>
      </div>

      {/* Quote history */}
      <div className="card">
        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-navy-400" />
          Historial de Cotizaciones ({client.quotes?.length || 0})
        </h2>
        {client.quotes?.length > 0 ? (
          <div className="space-y-3">
            {client.quotes.map((q) => (
              <Link
                key={q.id}
                to={`/quotes/${q.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-navy-800">{q.quote_number}</p>
                  <p className="text-sm text-navy-400">{formatDate(q.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${statusColors[q.status]}`}>
                    {statusLabels[q.status]}
                  </span>
                  <span className="font-bold text-navy-800">{formatCurrency(q.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-navy-400 text-center py-6">No hay cotizaciones para este cliente</p>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar Cliente">
          <EditClientForm
            client={client}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setShowEdit(false)}
            loading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, link }) {
  const content = (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <Icon size={20} className="text-navy-400 shrink-0" />
      <div>
        <p className="text-sm text-navy-400">{label}</p>
        <p className="font-semibold text-navy-800">{value || '—'}</p>
      </div>
    </div>
  );
  if (link && value) return <a href={link} target="_blank" rel="noopener noreferrer" className="hover:ring-2 ring-accent-300 rounded-xl transition-shadow">{content}</a>;
  return content;
}

function EditClientForm({ client, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: client.name || '',
    company: client.company || '',
    country: client.country || '',
    email: client.email || '',
    phone: client.phone || '',
    whatsapp: client.whatsapp || '',
    notes: client.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre *</label>
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
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={3} />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Cancelar</button>
        <button type="submit" className="btn-accent" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
