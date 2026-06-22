import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatRelative } from '../../utils/format';
import { AlertTriangle, Clock, Package, CreditCard, RotateCcw, Truck } from 'lucide-react';

const ICON_MAP = {
  OVERDUE: CreditCard,
  SLA_BREACH: Clock,
  LOW_STOCK: Package,
  CREDIT_FROZEN: CreditCard,
  DELIVERY_DELAY: Truck,
  RETURN_DELAY: RotateCcw,
};

const SEVERITY_STYLES = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low: 'bg-blue-50 border-blue-200 text-blue-700',
};

export default function CEOAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/reports/alerts'),
    refetchInterval: 30_000,
  });

  const alerts = data?.alerts || data?.data || [];

  return (
    <div>
      <PageHeader title="Alerts & Risk Center" subtitle="All active system alerts requiring attention" />

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-100 animate-pulse rounded-lg" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-surface-200 mx-auto mb-3" />
          <p className="text-text-muted">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = ICON_MAP[alert.type] || AlertTriangle;
            const styles = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium;
            return (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-lg border ${styles}`}>
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{alert.type?.replace(/_/g,' ')}</p>
                    <span className="text-xs opacity-70 flex-shrink-0">{formatRelative(alert.created_at || alert.timestamp)}</span>
                  </div>
                  <p className="text-sm mt-0.5 opacity-90">{alert.message || alert.description}</p>
                  {alert.entity_name && <p className="text-xs mt-1 opacity-70">{alert.entity_name}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
