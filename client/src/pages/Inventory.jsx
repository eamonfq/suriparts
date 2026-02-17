import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { formatCurrency, conditionColors, conditionLabels, locationColors } from '../utils/format';
import { Search, Filter, MapPin, Package, ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
  });

  const queryParams = {};
  if (search) queryParams.search = search;
  if (filters.condition) queryParams.condition = filters.condition;
  if (filters.location) queryParams.location = filters.location;
  if (filters.category) queryParams.category = filters.category;

  const { data, isLoading } = useQuery({
    queryKey: ['parts', queryParams],
    queryFn: () => api.getParts(queryParams),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  useEffect(() => {
    const s = searchParams.get('search');
    if (s) setSearch(s);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    setSearchParams(params);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ condition: '', location: '', category: '' });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl lg:text-3xl font-bold text-navy-900">Inventario</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Part Number, descripcion, aeronave..."
            className="input pl-12 pr-24 py-4 text-lg"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition-colors relative ${
                showFilters || activeFilterCount ? 'bg-accent-500 text-white' : 'hover:bg-gray-100 text-navy-500'
              }`}
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button type="submit" className="btn-primary btn-sm">
              Buscar
            </button>
          </div>
        </div>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy-800">Filtros</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-accent-600 font-semibold hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Condicion</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                className="input"
              >
                <option value="">Todas</option>
                <option value="NEW">Nuevo (NEW)</option>
                <option value="OH">Overhauled (OH)</option>
                <option value="SV">Serviceable (SV)</option>
                <option value="AR">As Removed (AR)</option>
                <option value="REPAIRED">Reparado</option>
              </select>
            </div>
            <div>
              <label className="label">Ubicacion</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="input"
              >
                <option value="">Todas</option>
                <option value="USA">USA</option>
                <option value="Colombia">Colombia</option>
                <option value="Venezuela">Venezuela</option>
              </select>
            </div>
            <div>
              <label className="label">Categoria</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="input"
              >
                <option value="">Todas</option>
                {categories?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner message="Buscando piezas..." />
      ) : !data?.parts?.length ? (
        <EmptyState
          title="No se encontraron piezas"
          message={search ? `No hay resultados para "${search}"` : 'El inventario esta vacio'}
        />
      ) : (
        <>
          <p className="text-navy-500 text-base">
            {data.total} pieza{data.total !== 1 ? 's' : ''} encontrada{data.total !== 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {data.parts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PartCard({ part }) {
  return (
    <Link
      to={`/inventory/${part.id}`}
      className="card flex items-center gap-4 hover:shadow-md hover:border-navy-200 transition-all group"
    >
      {/* Part image placeholder */}
      <div className="w-16 h-16 bg-navy-100 rounded-xl flex items-center justify-center shrink-0">
        <Package size={28} className="text-navy-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-navy-900 text-lg">{part.part_number}</h3>
          <span className={`badge text-xs ${conditionColors[part.condition]}`}>
            {part.condition}
          </span>
          <span className={`badge text-xs ${locationColors[part.location]}`}>
            <MapPin size={12} className="mr-1" />
            {part.location}
          </span>
        </div>
        <p className="text-navy-600 truncate">{part.description}</p>
        <div className="flex items-center gap-4 mt-1 text-sm text-navy-400">
          {part.aircraft_type && <span>{part.aircraft_type}</span>}
          <span>Qty: {part.quantity}</span>
          {part.certification && <span className="hidden sm:inline">{part.certification}</span>}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-navy-900">{formatCurrency(part.price)}</p>
        <ChevronRight size={20} className="text-navy-300 ml-auto group-hover:text-accent-500 transition-colors" />
      </div>
    </Link>
  );
}
