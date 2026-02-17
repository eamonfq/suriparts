import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, conditionColors, conditionLabels, locationColors } from '../utils/format';
import { ArrowLeft, MapPin, Package, Shield, Plane, Hash, Tag, Box, FileText } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function PartDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: part, isLoading } = useQuery({
    queryKey: ['part', id],
    queryFn: () => api.getPart(id),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!part) return <div className="text-center py-16 text-navy-500 text-lg">Pieza no encontrada</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-navy-500 hover:text-navy-700 text-base font-medium">
        <ArrowLeft size={20} />
        Volver al inventario
      </button>

      <div className="card">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 bg-navy-100 rounded-2xl flex items-center justify-center shrink-0">
            <Package size={36} className="text-navy-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">{part.part_number}</h1>
            <p className="text-lg text-navy-600 mt-1">{part.description}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`badge ${conditionColors[part.condition]}`}>
                {part.condition} — {conditionLabels[part.condition]}
              </span>
              <span className={`badge ${locationColors[part.location]}`}>
                <MapPin size={14} className="mr-1" />
                {part.location}
              </span>
            </div>
          </div>
        </div>

        {/* Price and stock */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-navy-50 to-accent-50 rounded-xl mb-6">
          <div>
            <p className="text-sm text-navy-500 font-medium">Precio Unitario</p>
            <p className="text-3xl font-bold text-navy-900">{formatCurrency(part.price)}</p>
          </div>
          <div>
            <p className="text-sm text-navy-500 font-medium">Cantidad Disponible</p>
            <p className="text-3xl font-bold text-navy-900">
              {part.quantity}
              <span className="text-lg font-normal text-navy-400 ml-1">uds.</span>
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <DetailRow icon={Hash} label="Serial Number" value={part.serial_number || 'N/A'} />
          <DetailRow icon={Plane} label="Tipo de Aeronave" value={part.aircraft_type || 'General'} />
          <DetailRow icon={Shield} label="Certificacion" value={part.certification || 'N/A'} />
          <DetailRow icon={Tag} label="Categoria" value={part.category || 'N/A'} />
          <DetailRow icon={MapPin} label="Ubicacion" value={part.location} />
          <DetailRow icon={Box} label="Condicion" value={`${part.condition} — ${conditionLabels[part.condition]}`} />
        </div>

        {part.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-navy-500" />
              <p className="font-semibold text-navy-700">Notas</p>
            </div>
            <p className="text-navy-600">{part.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
          <Link to={`/quotes/new?part_id=${part.id}`} className="btn-accent">
            <FileText size={20} />
            Crear Cotizacion con esta Pieza
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <Icon size={20} className="text-navy-400 shrink-0" />
      <div>
        <p className="text-sm text-navy-400">{label}</p>
        <p className="font-semibold text-navy-800">{value}</p>
      </div>
    </div>
  );
}
