import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, formatDate, statusLabels, statusColors } from '../utils/format';
import { FileText, Plus, Search, Filter, Copy } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';

const statuses = ['', 'draft', 'sent', 'accepted', 'rejected', 'expired'];

export default function Quotes() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  const params = {};
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes', params],
    queryFn: () => api.getQuotes(params),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => api.duplicateQuote(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setToast({ message: `Cotizacion ${data.quote_number} duplicada`, type: 'success' });
    },
    onError: () => setToast({ message: 'Error al duplicar', type: 'error' }),
  });

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">Cotizaciones</h1>
        <Link to="/quotes/new" className="btn-accent">
          <Plus size={20} />
          Nueva Cotizacion
        </Link>
      </div>

      {/* Search & filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cotizacion o cliente..."
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto min-w-[160px]"
        >
          <option value="">Todos los estados</option>
          {statuses.filter(Boolean).map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner message="Cargando cotizaciones..." />
      ) : !quotes?.length ? (
        <EmptyState
          icon={FileText}
          title="No hay cotizaciones"
          message="Crea tu primera cotizacion"
          action={
            <Link to="/quotes/new" className="btn-accent">
              <Plus size={20} /> Nueva Cotizacion
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Link
              key={q.id}
              to={`/quotes/${q.id}`}
              className="card flex items-center gap-4 hover:shadow-md hover:border-navy-200 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-navy-900 text-lg">{q.quote_number}</h3>
                  <span className={`badge text-xs ${statusColors[q.status]}`}>
                    {statusLabels[q.status]}
                  </span>
                </div>
                <p className="text-navy-600">{q.client_company || q.client_name}</p>
                <p className="text-sm text-navy-400">{formatDate(q.created_at)}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-navy-900">{formatCurrency(q.total)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    duplicateMutation.mutate(q.id);
                  }}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-navy-400 hover:text-navy-700 transition-colors"
                  title="Duplicar cotizacion"
                >
                  <Copy size={18} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
