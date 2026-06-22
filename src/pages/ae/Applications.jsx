import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function AEApplications() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['ae-applications', search, page],
    queryFn: () => api.get('/applications', {
      search,
      status: 'PENDING_ACCOUNTS_REVIEW',
      page, limit: 20
    }),
  });

  const apps = data?.applications || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'credit_limit_requested', label: 'Credit Requested', render: (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—' },
    { key: 'credit_days_requested', label: 'Credit Days', render: (v) => v ? `${v}d` : '—' },
    { key: 'created_at', label: 'Submitted', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Credit Setup Queue" subtitle="Applications approved by CRE awaiting credit configuration" />
      <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} className="mb-4" />
      <DataTable
        columns={columns}
        data={apps}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/ae/applications/${row.id}`)}
        emptyMessage="No applications pending credit setup"
      />
    </div>
  );
}
