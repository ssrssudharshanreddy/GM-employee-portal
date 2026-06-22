import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ label, value, delta, deltaLabel, icon: Icon, color = 'brand', loading }) {
  const colorMap = {
    brand: 'text-brand-600 bg-brand-50',
    green: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
    cyan: 'text-cyan-600 bg-cyan-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  const iconClass = colorMap[color] || colorMap.brand;
  const positive = delta > 0;
  const negative = delta < 0;

  return (
    <div className="bg-white rounded-lg shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-7 w-24 bg-surface-100 animate-pulse rounded" />
      ) : (
        <div className="text-2xl font-semibold text-text-primary font-mono">{value ?? '—'}</div>
      )}

      {(delta !== undefined || deltaLabel) && (
        <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
          {delta !== undefined && (
            <>
              {positive && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              {negative && <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className={positive ? 'text-emerald-600' : negative ? 'text-red-600' : ''}>
                {positive ? '+' : ''}{delta}
              </span>
            </>
          )}
          {deltaLabel && <span>{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
