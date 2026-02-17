import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { formatCurrency, timeAgo, statusLabels, statusColors } from '../utils/format';
import { FileText, Package, TrendingUp, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function StatCard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={26} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-navy-500">{label}</p>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        {sublabel && <p className="text-sm text-navy-400">{sublabel}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <img
          src="https://suriparts.com/wp-content/uploads/2025/04/cropped-suriparts-logo_Mesa-de-trabajo-1-scaled.png.webp"
          alt="SuriParts Corp"
          className="lg:hidden w-[180px] mx-auto mb-4"
        />
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">Panel Principal</h1>
        <p className="text-navy-500 text-lg mt-1">Bienvenido a SuriParts Corp</p>
      </div>

      {/* Quick search CTA */}
      <Link
        to="/inventory"
        className="card flex items-center gap-4 bg-gradient-to-r from-navy-800 to-navy-900 text-white border-0 hover:shadow-lg transition-shadow"
      >
        <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center shrink-0">
          <Package size={24} />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold">Buscar Piezas en Inventario</p>
          <p className="text-navy-300 text-base">Busca por Part Number, descripcion o tipo de aeronave</p>
        </div>
        <ArrowRight size={24} className="text-navy-300" />
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Cotizaciones Pendientes"
          value={data?.pending_quotes || 0}
          color="bg-accent-500"
        />
        <StatCard
          icon={FileText}
          label="Cotizaciones del Mes"
          value={data?.quotes_this_month || 0}
          color="bg-navy-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Aceptadas"
          value={data?.accepted_this_month || 0}
          sublabel={formatCurrency(data?.monthly_revenue)}
          color="bg-green-600"
        />
        <StatCard
          icon={Package}
          label="Piezas en Inventario"
          value={data?.total_parts || 0}
          sublabel={`${data?.total_inventory || 0} unidades`}
          color="bg-blue-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unanswered quotes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-accent-500" />
              Cotizaciones Sin Responder
            </h2>
            <Link to="/quotes?status=draft" className="text-accent-600 font-semibold text-sm hover:underline">
              Ver todas
            </Link>
          </div>
          {data?.unanswered_quotes?.length > 0 ? (
            <div className="space-y-3">
              {data.unanswered_quotes.map((q) => (
                <Link
                  key={q.id}
                  to={`/quotes/${q.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-navy-800">{q.quote_number}</p>
                    <p className="text-sm text-navy-500">{q.client_company}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy-800">{formatCurrency(q.total)}</p>
                    <p className="text-sm text-navy-400">{timeAgo(q.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-center py-6">No hay cotizaciones pendientes</p>
          )}
        </div>

        {/* Top requested parts */}
        <div className="card">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Piezas Mas Solicitadas</h2>
          {data?.top_parts?.length > 0 ? (
            <div className="space-y-3">
              {data.top_parts.map((p, i) => (
                <div key={p.part_number} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 bg-navy-800 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-800 truncate">{p.part_number}</p>
                    <p className="text-sm text-navy-500 truncate">{p.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-navy-700">{p.times_quoted}x cotizada</p>
                    <p className="text-sm text-navy-400">{p.total_qty} uds.</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-center py-6">Sin datos aun</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <h2 className="text-lg font-bold text-navy-900 mb-4">Actividad Reciente</h2>
        {data?.recent_activity?.length > 0 ? (
          <div className="space-y-2">
            {data.recent_activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  a.action === 'created' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-base text-navy-700">{a.description}</p>
                  <p className="text-sm text-navy-400">{timeAgo(a.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-navy-400 text-center py-6">Sin actividad reciente</p>
        )}
      </div>
    </div>
  );
}
