import { Search } from 'lucide-react';

export default function FilterBar({ search, onSearch, filters = [], className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {onSearch !== undefined && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search…"
            value={search || ''}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-text-muted"
          />
        </div>
      )}

      {filters.map((f, i) => (
        <div key={i} className="flex-shrink-0">
          {f.type === 'select' ? (
            <select
              value={f.value || ''}
              onChange={(e) => f.onChange(e.target.value || undefined)}
              className="text-sm border border-surface-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-text-primary"
            >
              <option value="">{f.placeholder || f.label || 'All'}</option>
              {(f.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : f.type === 'date' ? (
            <input
              type="date"
              value={f.value || ''}
              onChange={(e) => f.onChange(e.target.value || undefined)}
              className="text-sm border border-surface-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          ) : (
            <button
              onClick={() => f.onChange(!f.value)}
              className={`text-sm px-3 py-2 rounded-md border font-medium transition-colors ${
                f.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-text-secondary border-surface-200 hover:bg-surface-100'
              }`}
            >
              {f.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
