import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency } from '../../utils/format';

const STATUS_OPTS = ['UNPAID','PARTIALLY_PAID','PAID','OVERDUE'].map(s => ({ value: s, label: s.replace(/_/g,' ') }));

export default function AEInvoices() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, status, page],
    queryFn: () => api.get('/invoices', { search, status: status || undefined, page, limit: 20 }),
  });

  const invoices = data?.invoices || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'invoice_number', label: 'Invoice #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'total_amount', label: 'Amount', render: (v) => formatCurrency(v) },
    { key: 'paid_amount', label: 'Paid', render: (v) => formatCurrency(v) },
    { key: 'due_date', label: 'Due Date', render: (v, row) => (
      <span className={row.status === 'OVERDUE' ? 'text-red-600 font-medium' : ''}>{formatDate(v)}</span>
    )},
  ];

  return (
    <div>
      <PageHeader title="Invoice Management" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); }, placeholder: 'All Statuses', options: STATUS_OPTS }]}
      />
      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/ae/invoices/${row.id}`)}
        emptyMessage="No invoices found"
      />
    </div>
  );
}
