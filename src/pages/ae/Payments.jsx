import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency } from '../../utils/format';

const STATUS_OPTS = [
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { value: 'PAYMENT_VERIFIED', label: 'Verified' },
  { value: 'PAYMENT_REJECTED', label: 'Rejected' },
];

export default function AEPayments() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('PENDING_VERIFICATION');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search, status, page],
    queryFn: () => api.get('/payments', { search, status: status || undefined, page, limit: 20 }),
  });

  const payments = data?.payments || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Customer' },
    { key: 'payment_method', label: 'Method', render: (v) => v?.replace(/_/g,' ') || '—' },
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'reference_number', label: 'Reference', render: (v) => <span className="font-mono text-xs">{v || '—'}</span> },
    { key: 'created_at', label: 'Submitted', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Payment Verification" subtitle="Review and verify customer payment submissions" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); }, placeholder: 'All Statuses', options: STATUS_OPTS }]}
      />
      <DataTable
        columns={columns}
        data={payments}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/ae/payments/${row.id}`)}
        emptyMessage="No payments found"
      />
    </div>
  );
}
