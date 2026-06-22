import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatCurrencyCompact, formatDate } from '../../utils/format';

export default function AECustomers() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['ae-customers', search, overdue, page],
    queryFn: () => api.get('/customers', { search, overdue: overdue ? true : undefined, status: 'ACTIVE', page, limit: 20 }),
  });

  const customers = data?.customers || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'credit_limit', label: 'Credit Limit', render: (v) => formatCurrencyCompact(v) },
    { key: 'outstanding_amount', label: 'Outstanding', render: (v, row) => (
      <span className={Number(v) > 0 ? 'font-semibold text-red-600' : ''}>{formatCurrencyCompact(v)}</span>
    )},
    { key: 'credit_days', label: 'Credit Days', render: (v) => v ? `${v}d` : '—' },
    { key: 'last_payment_date', label: 'Last Payment', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Customer Financial Profiles" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'toggle', label: 'Overdue Only', value: overdue, onChange: (v) => { setOverdue(v); setPage(1); } }]}
      />
      <DataTable
        columns={columns}
        data={customers}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/ae/customers/${row.id}`)}
        emptyMessage="No customers found"
      />
    </div>
  );
}
