import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function CRETickets() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['cre-tickets', search, status, page],
    queryFn: () => api.get('/tickets', { search, status: status || undefined, page, limit: 20 }),
  });

  const tickets = data?.tickets || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'ticket_number', label: 'Ticket #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'subject', label: 'Subject' },
    { key: 'company_name', label: 'Customer' },
    { key: 'category', label: 'Category', render: (v) => v?.replace(/_/g,' ') || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Ticket Oversight" subtitle="All tickets across your portfolio" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); },
          placeholder: 'All Statuses',
          options: ['OPEN','IN_PROGRESS','ESCALATED','RESOLVED','CLOSED'].map(s => ({ value: s, label: s.replace(/_/g,' ') })) }]}
      />
      <DataTable
        columns={columns}
        data={tickets}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/crem/tickets/${row.id}`)}
        emptyMessage="No tickets"
      />
    </div>
  );
}
