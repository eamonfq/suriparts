export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return formatDate(dateStr);
}

export const conditionLabels = {
  NEW: 'Nuevo',
  OH: 'Overhauled',
  SV: 'Serviceable',
  AR: 'As Removed',
  REPAIRED: 'Reparado',
};

export const conditionColors = {
  NEW: 'bg-green-100 text-green-800',
  OH: 'bg-blue-100 text-blue-800',
  SV: 'bg-cyan-100 text-cyan-800',
  AR: 'bg-yellow-100 text-yellow-800',
  REPAIRED: 'bg-purple-100 text-purple-800',
};

export const locationColors = {
  USA: 'bg-blue-600 text-white',
  Colombia: 'bg-yellow-500 text-white',
  Venezuela: 'bg-red-600 text-white',
};

export const statusLabels = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Expirada',
};

export const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-yellow-100 text-yellow-800',
};

export const urgencyLabels = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  critical: 'Crítica',
};

export const urgencyColors = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const rfqStatusLabels = {
  pending: 'Pendiente',
  responded: 'Respondida',
  no_stock: 'Sin Stock',
};

export const rfqStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  responded: 'bg-green-100 text-green-800',
  no_stock: 'bg-red-100 text-red-800',
};
