import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { formatCurrencyCompact, formatDate } from '../../utils/format';
import KPICard from '../../components/KPICard';
import { TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export default function AEOutstanding() {
  const [, navigate] = useLocation();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['outstanding-summary'],
    queryFn: () => api.get('/reports/ae/outstanding'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['outstanding-customers'],
    queryFn: () => api.get('/customers', { overdue: true, limit: 50 }),
  });

  const kpis = summary?.kpis || {};
  const customers = data?.customers || data?.data || [];

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'outstanding_amount', label: 'Outstanding', render: (v) => <span className="font-semibold text-red-600">{formatCurrencyCompact(v)}</span> },
    { key: 'overdue_days', label: 'Overdue Days', render: (v) => v ? <span className="text-red-600">{v}d</span> : '—' },
    { key: 'credit_days', label: 'Credit Days', render: (v) => v ? `${v}d` : '—' },
    { key: 'last_payment_date', label: 'Last Payment', render: (v) => formatDate(v) },
    { key: 'crem_name', label: 'CREM' },
  ];

  return (
    <div>
      <PageHeader title="Outstanding & Aging Report" subtitle="Overdue amounts across all customers" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KPICard label="Total Outstanding" value={formatCurrencyCompact(kpis.total_outstanding)} icon={TrendingUp} color="red" loading={loadingSummary} />
        <KPICard label="0–30 Days" value={formatCurrencyCompact(kpis.bucket_30)} icon={DollarSign} color="amber" loading={loadingSummary} />
        <KPICard label="30+ Days" value={formatCurrencyCompact(kpis.bucket_30_plus)} icon={AlertTriangle} color="red" loading={loadingSummary} />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={isLoading}
        total={customers.length}
        emptyMessage="No outstanding amounts"
        onRowClick={(row) => navigate(`/ae/customers/${row.id}`)}
      />
    </div>
  );
}
