import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

const STATUS_OPTS = [
  { value: 'APPLICATION_SUBMITTED', label: 'Submitted' },
  { value: 'PENDING_CRE_REVIEW', label: 'Pending CRE Review' },
  { value: 'ACTION_REQUIRED', label: 'Action Required' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function CREApplications() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['applications', search, status, page],
    queryFn: () => api.get('/applications', { search, status: status || undefined, page, limit: 20 }),
  });

  const apps = data?.applications || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'gstin', label: 'GSTIN', render: (v) => v || '—' },
    { key: 'created_at', label: 'Submitted', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Application Queue" subtitle="Pending customer applications for review" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); }, placeholder: 'All Statuses', options: STATUS_OPTS }]}
      />
      <DataTable
        columns={columns}
        data={apps}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/cre/applications/${row.id}`)}
        emptyMessage="No applications found"
      />
    </div>
  );
}
