import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrencyCompact } from '../../utils/format';

export default function CRECustomers() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['cre-customers', search, status, page],
    queryFn: () => api.get('/customers', { search, status: status || undefined, page, limit: 20 }),
  });

  const customers = data?.customers || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'crem_name', label: 'CREM Assigned', render: (v) => v || 'Unassigned' },
    { key: 'outstanding_amount', label: 'Outstanding', render: (v) => formatCurrencyCompact(v) },
    { key: 'created_at', label: 'Joined', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Customer Portfolio" subtitle="All customers across your portfolio" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[
          { type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); },
            placeholder: 'All Statuses',
            options: ['ACTIVE','SUSPENDED','BLOCKED','PENDING_CRE_REVIEW'].map(s => ({ value: s, label: s.replace(/_/g,' ') })) },
        ]}
      />
      <DataTable
        columns={columns}
        data={customers}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/cre/customers/${row.id}`)}
        emptyMessage="No customers found"
      />
    </div>
  );
}
