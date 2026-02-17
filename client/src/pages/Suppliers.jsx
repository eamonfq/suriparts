import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { formatCurrency, urgencyLabels, urgencyColors, rfqStatusLabels, rfqStatusColors, formatDate } from '../utils/format';
import { Search, Plus, Truck, Send, ChevronDown, ChevronUp, Package } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

export default function Suppliers() {
  const [search, setSearch] = useState('');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showRFQForm, setShowRFQForm] = useState(false);
  const [expandedSupplier, setExpandedSupplier] = useState(null);
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: () => api.getSuppliers(search),
  });

  const { data: rfqs } = useQuery({
    queryKey: ['rfqs'],
    queryFn: () => api.getRFQs({}),
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data) => api.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowSupplierForm(false);
      setToast({ message: 'Proveedor creado', type: 'success' });
    },
  });

  const createRFQMutation = useMutation({
    mutationFn: (data) => api.createRFQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      setShowRFQForm(false);
      setToast({ message: 'Solicitud enviada', type: 'success' });
    },
  });

  const updateRFQMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateRFQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      setToast({ message: 'RFQ actualizada', type: 'success' });
    },
  });

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">Proveedores</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowRFQForm(true)} className="btn-primary btn-sm">
            <Send size={18} /> Nueva Consulta (RFQ)
          </button>
          <button onClick={() => setShowSupplierForm(true)} className="btn-accent btn-sm">
            <Plus size={18} /> Proveedor
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor..."
          className="input pl-10"
        />
      </div>

      {/* RFQs section */}
      {rfqs?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Consultas Activas (RFQ)</h2>
          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-navy-900">{rfq.part_number}</p>
                    <p className="text-sm text-navy-500">{rfq.description} — Qty: {rfq.quantity}</p>
                    <p className="text-sm text-navy-400">Proveedor: {rfq.supplier_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${urgencyColors[rfq.urgency]}`}>
                      {urgencyLabels[rfq.urgency]}
                    </span>
                    <span className={`badge text-xs ${rfqStatusColors[rfq.status]}`}>
                      {rfqStatusLabels[rfq.status]}
                    </span>
                  </div>
                </div>
                {rfq.status === 'responded' && rfq.response_price && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800"><strong>Respuesta:</strong> {formatCurrency(rfq.response_price)} por unidad</p>
                    {rfq.response_notes && <p className="text-sm text-green-700 mt-1">{rfq.response_notes}</p>}
                  </div>
                )}
                {rfq.status === 'no_stock' && rfq.response_notes && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">{rfq.response_notes}</p>
                  </div>
                )}
                {rfq.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        const price = prompt('Precio de respuesta (USD):');
                        const notes = prompt('Notas de respuesta:');
                        if (price !== null) {
                          updateRFQMutation.mutate({
                            id: rfq.id,
                            data: { status: 'responded', response_price: parseFloat(price) || 0, response_notes: notes || '' }
                          });
                        }
                      }}
                      className="btn-outline btn-sm text-green-700 border-green-300 hover:bg-green-50"
                    >
                      Registrar Respuesta
                    </button>
                    <button
                      onClick={() => updateRFQMutation.mutate({ id: rfq.id, data: { status: 'no_stock', response_notes: 'Sin stock disponible' } })}
                      className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Sin Stock
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supplier list */}
      {isLoading ? (
        <LoadingSpinner message="Cargando proveedores..." />
      ) : !suppliers?.length ? (
        <EmptyState
          icon={Truck}
          title="No hay proveedores"
          message="Agrega tu primer proveedor"
          action={
            <button onClick={() => setShowSupplierForm(true)} className="btn-accent">
              <Plus size={20} /> Nuevo Proveedor
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="card">
              <button
                onClick={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
                className="w-full flex items-center gap-4 text-left"
              >
                <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Truck size={24} className="text-navy-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-lg">{supplier.name}</h3>
                  <p className="text-navy-600">{supplier.contact_name} — {supplier.country}</p>
                  <p className="text-sm text-navy-400 truncate">{supplier.specialty}</p>
                </div>
                {expandedSupplier === supplier.id ? <ChevronUp size={20} className="text-navy-400" /> : <ChevronDown size={20} className="text-navy-400" />}
              </button>
              {expandedSupplier === supplier.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-base"><span className="text-navy-400">Email:</span> <a href={`mailto:${supplier.email}`} className="text-accent-600 font-medium">{supplier.email}</a></p>
                  <p className="text-base"><span className="text-navy-400">Telefono:</span> {supplier.phone}</p>
                  <p className="text-base"><span className="text-navy-400">Especialidad:</span> {supplier.specialty}</p>
                  {supplier.notes && <p className="text-base"><span className="text-navy-400">Notas:</span> {supplier.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Supplier Modal */}
      <Modal open={showSupplierForm} onClose={() => setShowSupplierForm(false)} title="Nuevo Proveedor">
        <SupplierForm
          onSubmit={(data) => createSupplierMutation.mutate(data)}
          onCancel={() => setShowSupplierForm(false)}
          loading={createSupplierMutation.isPending}
        />
      </Modal>

      {/* New RFQ Modal */}
      <Modal open={showRFQForm} onClose={() => setShowRFQForm(false)} title="Nueva Consulta a Proveedor (RFQ)">
        <RFQForm
          suppliers={suppliers || []}
          onSubmit={(data) => createRFQMutation.mutate(data)}
          onCancel={() => setShowRFQForm(false)}
          loading={createRFQMutation.isPending}
        />
      </Modal>
    </div>
  );
}

function SupplierForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '', contact_name: '', email: '', phone: '', country: 'USA', specialty: '', notes: '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Nombre de la Empresa *</label>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Contacto</label>
          <input type="text" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Pais</label>
          <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Telefono</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Especialidad</label>
        <input type="text" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="input" placeholder="Ej: Wheels, brakes, avionics..." />
      </div>
      <div>
        <label className="label">Notas</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Cancelar</button>
        <button type="submit" className="btn-accent" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  );
}

function RFQForm({ suppliers, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    supplier_id: '', part_number: '', description: '', quantity: 1, urgency: 'normal',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, supplier_id: Number(form.supplier_id) }); }} className="space-y-4">
      <div>
        <label className="label">Proveedor *</label>
        <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="input" required>
          <option value="">Seleccionar proveedor...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Part Number *</label>
        <input type="text" value={form.part_number} onChange={(e) => setForm({ ...form, part_number: e.target.value })} className="input" required />
      </div>
      <div>
        <label className="label">Descripcion</label>
        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Cantidad</label>
          <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} className="input" />
        </div>
        <div>
          <label className="label">Urgencia</label>
          <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="input">
            <option value="low">Baja</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="critical">Critica</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Cancelar</button>
        <button type="submit" className="btn-accent" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Consulta'}</button>
      </div>
    </form>
  );
}
