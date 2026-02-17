import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/format';
import { ArrowLeft, Plus, Trash2, Search, Check } from 'lucide-react';
import Toast from '../components/ui/Toast';

export default function QuoteForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState(null);

  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [items, setItems] = useState([]);
  const [partSearch, setPartSearch] = useState('');
  const [showPartSearch, setShowPartSearch] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const { data: partsData } = useQuery({
    queryKey: ['parts-search', partSearch],
    queryFn: () => api.getParts({ search: partSearch, limit: 10 }),
    enabled: partSearch.length > 1,
  });

  // Pre-fill from URL part_id
  const prePartId = searchParams.get('part_id');
  const { data: prePart } = useQuery({
    queryKey: ['part', prePartId],
    queryFn: () => api.getPart(prePartId),
    enabled: !!prePartId,
  });

  useEffect(() => {
    if (prePart && items.length === 0) {
      setItems([{
        part_id: prePart.id,
        part_number: prePart.part_number,
        description: prePart.description,
        condition: prePart.condition,
        quantity: 1,
        unit_price: prePart.price,
      }]);
    }
  }, [prePart]);

  const createMutation = useMutation({
    mutationFn: (data) => api.createQuote(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      navigate(`/quotes/${data.id}`);
    },
    onError: () => setToast({ message: 'Error al crear cotizacion', type: 'error' }),
  });

  const addPart = (part) => {
    setItems([...items, {
      part_id: part.id,
      part_number: part.part_number,
      description: part.description,
      condition: part.condition,
      quantity: 1,
      unit_price: part.price,
    }]);
    setPartSearch('');
    setShowPartSearch(false);
  };

  const addEmptyLine = () => {
    setItems([...items, {
      part_id: null,
      part_number: '',
      description: '',
      condition: 'NEW',
      quantity: 1,
      unit_price: 0,
    }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId) {
      setToast({ message: 'Selecciona un cliente', type: 'error' });
      return;
    }
    if (items.length === 0) {
      setToast({ message: 'Agrega al menos una pieza', type: 'error' });
      return;
    }
    createMutation.mutate({
      client_id: Number(clientId),
      notes,
      valid_until: validUntil,
      items,
    });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <button onClick={() => navigate('/quotes')} className="flex items-center gap-2 text-navy-500 hover:text-navy-700 text-base font-medium">
        <ArrowLeft size={20} />
        Volver a cotizaciones
      </button>

      <h1 className="text-2xl font-bold text-navy-900">Nueva Cotizacion</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client selection */}
        <div className="card">
          <h2 className="text-lg font-bold text-navy-800 mb-4">Datos del Cliente</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Cliente *</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="input" required>
                <option value="">Seleccionar cliente...</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.company} — {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Valida Hasta</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Notas</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Notas internas..." />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-800">Piezas</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowPartSearch(true)} className="btn-outline btn-sm">
                <Search size={18} /> Buscar Pieza
              </button>
              <button type="button" onClick={addEmptyLine} className="btn-ghost btn-sm">
                <Plus size={18} /> Linea Manual
              </button>
            </div>
          </div>

          {/* Part search popup */}
          {showPartSearch && (
            <div className="mb-4 p-4 bg-navy-50 rounded-xl">
              <div className="relative mb-3">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  placeholder="Buscar por Part Number..."
                  className="input pl-10"
                  autoFocus
                />
              </div>
              {partsData?.parts?.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {partsData.parts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addPart(p)}
                      className="w-full flex items-center justify-between p-3 bg-white rounded-xl hover:bg-accent-50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-semibold text-navy-800">{p.part_number}</p>
                        <p className="text-sm text-navy-500">{p.description} — {p.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(p.price)}</p>
                        <p className="text-sm text-navy-400">Qty: {p.quantity}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setShowPartSearch(false)} className="mt-2 text-sm text-navy-500 hover:underline">
                Cerrar busqueda
              </button>
            </div>
          )}

          {/* Items list */}
          {items.length === 0 ? (
            <p className="text-center text-navy-400 py-8">No hay piezas agregadas. Usa el boton "Buscar Pieza" para agregar.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div className="col-span-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-navy-500">Part Number</label>
                      <input
                        type="text"
                        value={item.part_number}
                        onChange={(e) => updateItem(i, 'part_number', e.target.value)}
                        className="input py-2 text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-navy-500">Descripcion</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        className="input py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-navy-500">Condicion</label>
                      <select
                        value={item.condition}
                        onChange={(e) => updateItem(i, 'condition', e.target.value)}
                        className="input py-2 text-sm"
                      >
                        <option value="NEW">NEW</option>
                        <option value="OH">OH</option>
                        <option value="SV">SV</option>
                        <option value="AR">AR</option>
                        <option value="REPAIRED">REPAIRED</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-navy-500">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                          className="input py-2 text-sm"
                        />
                      </div>
                      <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl mb-0.5">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-navy-500">Precio Unitario (USD)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="input py-2 text-sm"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-4 flex items-end justify-end">
                      <p className="text-base font-semibold text-navy-800">
                        Subtotal: {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {items.length > 0 && (
            <div className="flex justify-end mt-4 p-4 bg-navy-50 rounded-xl">
              <div className="text-right">
                <p className="text-sm text-navy-500">Total de la cotizacion</p>
                <p className="text-3xl font-bold text-navy-900">{formatCurrency(total)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/quotes')} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" className="btn-accent" disabled={createMutation.isPending}>
            <Check size={20} />
            {createMutation.isPending ? 'Creando...' : 'Crear Cotizacion'}
          </button>
        </div>
      </form>
    </div>
  );
}
