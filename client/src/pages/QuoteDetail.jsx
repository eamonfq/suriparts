import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, formatDate, statusLabels, statusColors, conditionColors } from '../utils/format';
import { ArrowLeft, Send, Check, X, Copy, MessageCircle, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => api.getQuote(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.updateQuote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setToast({ message: 'Cotizacion actualizada', type: 'success' });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => api.duplicateQuote(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      navigate(`/quotes/${data.id}`);
      setToast({ message: `Duplicada como ${data.quote_number}`, type: 'success' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      navigate('/quotes');
    },
  });

  const generateWhatsAppText = () => {
    if (!quote) return '';
    let text = `*Cotizacion ${quote.quote_number}*\n`;
    text += `SuriParts Corp\n\n`;
    quote.items?.forEach((item, i) => {
      text += `${i + 1}. P/N: ${item.part_number}\n`;
      text += `   ${item.description}\n`;
      text += `   Cond: ${item.condition} | Qty: ${item.quantity} | ${formatCurrency(item.unit_price)} c/u\n`;
      text += `   Subtotal: ${formatCurrency(item.total_price)}\n\n`;
    });
    text += `*TOTAL: ${formatCurrency(quote.total)}*\n`;
    text += `Valida hasta: ${formatDate(quote.valid_until)}\n`;
    return text;
  };

  const shareWhatsApp = () => {
    const text = generateWhatsAppText();
    const phone = quote.client_whatsapp?.replace(/[^0-9]/g, '') || '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareEmail = () => {
    const subject = `Cotizacion ${quote.quote_number} - SuriParts Corp`;
    const body = generateWhatsAppText().replace(/\*/g, '');
    window.open(`mailto:${quote.client_email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!quote) return <div className="text-center py-16 text-navy-500 text-lg">Cotizacion no encontrada</div>;

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Eliminar Cotizacion"
        message={`¿Seguro que deseas eliminar la cotizacion ${quote.quote_number}? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        danger
      />

      <button onClick={() => navigate('/quotes')} className="flex items-center gap-2 text-navy-500 hover:text-navy-700 text-base font-medium">
        <ArrowLeft size={20} />
        Volver a cotizaciones
      </button>

      <div className="card">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-navy-900">{quote.quote_number}</h1>
              <span className={`badge text-base ${statusColors[quote.status]}`}>
                {statusLabels[quote.status]}
              </span>
            </div>
            <p className="text-lg text-navy-600 mt-1">{quote.client_company || quote.client_name}</p>
            <p className="text-navy-400">Creada: {formatDate(quote.created_at)} | Valida hasta: {formatDate(quote.valid_until)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-navy-400">Total</p>
            <p className="text-3xl font-bold text-navy-900">{formatCurrency(quote.total)}</p>
          </div>
        </div>

        {/* Client info */}
        <div className="p-4 bg-gray-50 rounded-xl mb-6">
          <h3 className="font-semibold text-navy-700 mb-2">Datos del Cliente</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-base">
            <p><span className="text-navy-400">Contacto:</span> {quote.client_name}</p>
            <p><span className="text-navy-400">Empresa:</span> {quote.client_company}</p>
            <p><span className="text-navy-400">Email:</span> {quote.client_email}</p>
            <p><span className="text-navy-400">Pais:</span> {quote.client_country}</p>
          </div>
        </div>

        {/* Items table */}
        <h3 className="font-semibold text-navy-700 mb-3">Lineas de Cotizacion</h3>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-sm font-semibold text-navy-500">Part Number</th>
                <th className="text-left px-3 py-3 text-sm font-semibold text-navy-500">Descripcion</th>
                <th className="text-center px-3 py-3 text-sm font-semibold text-navy-500">Cond.</th>
                <th className="text-center px-3 py-3 text-sm font-semibold text-navy-500">Qty</th>
                <th className="text-right px-3 py-3 text-sm font-semibold text-navy-500">P. Unit.</th>
                <th className="text-right px-5 py-3 text-sm font-semibold text-navy-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items?.map((item, i) => (
                <tr key={item.id || i} className="border-b border-gray-100">
                  <td className="px-5 py-3 font-semibold text-navy-900">{item.part_number}</td>
                  <td className="px-3 py-3 text-navy-600">{item.description}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`badge text-xs ${conditionColors[item.condition]}`}>{item.condition}</span>
                  </td>
                  <td className="px-3 py-3 text-center font-semibold">{item.quantity}</td>
                  <td className="px-3 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-navy-50">
                <td colSpan={5} className="px-5 py-3 text-right font-bold text-navy-800 text-lg">TOTAL</td>
                <td className="px-5 py-3 text-right font-bold text-navy-900 text-lg">{formatCurrency(quote.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {quote.notes && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm font-semibold text-yellow-800 mb-1">Notas</p>
            <p className="text-yellow-900">{quote.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
          {quote.status === 'draft' && (
            <button onClick={() => updateMutation.mutate({ status: 'sent' })} className="btn-primary">
              <Send size={20} /> Marcar como Enviada
            </button>
          )}
          {quote.status === 'sent' && (
            <>
              <button onClick={() => updateMutation.mutate({ status: 'accepted' })} className="btn-primary bg-green-600 hover:bg-green-700">
                <Check size={20} /> Aceptada
              </button>
              <button onClick={() => updateMutation.mutate({ status: 'rejected' })} className="btn-outline border-red-300 text-red-600 hover:bg-red-50">
                <X size={20} /> Rechazada
              </button>
            </>
          )}
          <button onClick={shareWhatsApp} className="btn-outline border-green-300 text-green-700 hover:bg-green-50">
            <MessageCircle size={20} /> WhatsApp
          </button>
          <button onClick={shareEmail} className="btn-outline">
            <Mail size={20} /> Email
          </button>
          <button onClick={() => duplicateMutation.mutate()} className="btn-ghost">
            <Copy size={20} /> Duplicar
          </button>
          <button onClick={() => setConfirmDelete(true)} className="btn-ghost text-red-600 hover:bg-red-50 ml-auto">
            <Trash2 size={20} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
