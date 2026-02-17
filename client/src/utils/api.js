const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Parts
  getParts: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/parts?${qs}`);
  },
  getPart: (id) => request(`/parts/${id}`),
  getCategories: () => request('/parts/categories'),
  createPart: (data) => request('/parts', { method: 'POST', body: JSON.stringify(data) }),
  updatePart: (id, data) => request(`/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePart: (id) => request(`/parts/${id}`, { method: 'DELETE' }),

  // Clients
  getClients: (search) => request(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getClient: (id) => request(`/clients/${id}`),
  createClient: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),

  // Quotes
  getQuotes: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/quotes?${qs}`);
  },
  getQuote: (id) => request(`/quotes/${id}`),
  getQuoteStats: () => request('/quotes/stats'),
  createQuote: (data) => request('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateQuote: (id, data) => request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  duplicateQuote: (id) => request(`/quotes/${id}/duplicate`, { method: 'POST' }),
  deleteQuote: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: (search) => request(`/suppliers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getSupplier: (id) => request(`/suppliers/${id}`),
  createSupplier: (data) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // RFQs
  getRFQs: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/rfqs?${qs}`);
  },
  getRFQ: (id) => request(`/rfqs/${id}`),
  createRFQ: (data) => request('/rfqs', { method: 'POST', body: JSON.stringify(data) }),
  updateRFQ: (id, data) => request(`/rfqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
