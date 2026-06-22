import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import { formatCurrencyCompact, formatPercent } from '../../utils/format';
import { DollarSign, TrendingUp, CreditCard, FileText } from 'lucide-react';

export default function AEReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['ae-reports'],
    queryFn: () => api.get('/reports/ae/summary'),
  });

  const r = data?.report || data || {};

  return (
    <div>
      <PageHeader title="AE Reports" subtitle="Payment collections, aging, and credit performance" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Collected MTD" value={formatCurrencyCompact(r.collected_mtd)} icon={DollarSign} color="green" loading={isLoading} />
        <KPICard label="Payments Verified" value={r.payments_verified} icon={CreditCard} color="brand" loading={isLoading} />
        <KPICard label="Collection Rate" value={formatPercent(r.collection_rate)} icon={TrendingUp} color="cyan" loading={isLoading} />
        <KPICard label="Overdue Invoices" value={r.overdue_invoices} icon={FileText} color="red" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Aging Buckets</h2>
          {(r.aging || []).map((b) => (
            <div key={b.bucket} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
              <span className="text-sm text-text-secondary">{b.bucket}</span>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrencyCompact(b.amount)}</p>
                <p className="text-xs text-text-muted">{b.count} invoices</p>
              </div>
            </div>
          ))}
          {!r.aging && !isLoading && <p className="text-sm text-text-muted text-center py-4">No aging data</p>}
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Payment Methods</h2>
          {(r.payment_methods || []).map((m) => (
            <div key={m.method} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
              <span className="text-sm text-text-secondary">{m.method?.replace(/_/g,' ')}</span>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrencyCompact(m.amount)}</p>
                <p className="text-xs text-text-muted">{m.count} payments</p>
              </div>
            </div>
          ))}
          {!r.payment_methods && !isLoading && <p className="text-sm text-text-muted text-center py-4">No data</p>}
        </div>
      </div>
    </div>
  );
}
