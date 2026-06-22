import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import { formatNumber, formatCurrencyCompact } from '../../utils/format';
import { Package, ShoppingCart, RotateCcw, Archive } from 'lucide-react';

export default function WEReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['we-reports'],
    queryFn: () => api.get('/reports/we/summary'),
  });

  const r = data?.report || data || {};

  return (
    <div>
      <PageHeader title="WE Reports" subtitle="Inventory, fulfillment, and warehouse performance" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Orders Fulfilled" value={r.orders_fulfilled} icon={ShoppingCart} color="green" loading={isLoading} />
        <KPICard label="Returns Processed" value={r.returns_processed} icon={RotateCcw} color="orange" loading={isLoading} />
        <KPICard label="Inventory Value" value={formatCurrencyCompact(r.inventory_value)} icon={Archive} color="brand" loading={isLoading} />
        <KPICard label="Low Stock Items" value={r.low_stock_count} icon={Package} color="red" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Order Status Breakdown</h2>
          {(r.order_breakdown || []).map((item) => (
            <div key={item.status} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-secondary">{item.status?.replace(/_/g,' ')}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
          {!r.order_breakdown && !isLoading && <p className="text-sm text-text-muted text-center py-4">No data available</p>}
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">WS Staff Performance</h2>
          {(r.ws_performance || []).map((member) => (
            <div key={member.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
              <p className="text-sm">{member.full_name}</p>
              <div className="text-right">
                <p className="text-sm font-semibold">{member.deliveries_count} deliveries</p>
                <p className="text-xs text-text-muted">this month</p>
              </div>
            </div>
          ))}
          {!r.ws_performance && !isLoading && <p className="text-sm text-text-muted text-center py-4">No data</p>}
        </div>
      </div>
    </div>
  );
}
