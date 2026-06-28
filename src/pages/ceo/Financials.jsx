import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import { formatCurrencyCompact, formatCurrency } from '../../utils/format';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CEOFinancials() {
  const { data, isLoading } = useQuery({
    queryKey: ['ceo-financials'],
    queryFn: () => api.get('/reports/ceo/financials'),
  });

  const kpis = data?.kpis || {};
  const aging = data?.aging_buckets || [];
  const revenueByMonth = data?.revenue_by_month || [];

  return (
    <div>
      <PageHeader title="Financial Command Center" subtitle="Revenue, collections, and credit exposure" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Revenue MTD" value={formatCurrencyCompact(kpis.revenue_mtd)} icon={DollarSign} color="green" loading={isLoading} />
        <KPICard label="Total Outstanding" value={formatCurrencyCompact(kpis.total_outstanding)} icon={TrendingUp} color="amber" loading={isLoading} />
        <KPICard label="Overdue Amount" value={formatCurrencyCompact(kpis.overdue_amount)} icon={AlertTriangle} color="red" loading={isLoading} />
        <KPICard label="Credit Exposure" value={formatCurrencyCompact(kpis.credit_exposure)} icon={CreditCard} color="purple" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Revenue by Month</h2>
          {revenueByMonth.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-text-muted text-sm">No revenue data available</div>
          )}
        </div>

        {/* Aging Buckets */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Aging Buckets</h2>
          <div className="space-y-3">
            {aging.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">No aging data</p>
            ) : (
              aging.map((bucket) => (
                <div key={bucket.bucket} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                  <span className="text-sm font-medium text-text-secondary">{bucket.bucket} days</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{formatCurrencyCompact(bucket.amount)}</p>
                    <p className="text-xs text-text-muted">{bucket.count} invoices</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
