import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function CREMTickets() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['crem-tickets', search, status, page],
    queryFn: () => api.get('/tickets', { search, status: status || undefined, my_tickets: true, page, limit: 20 }),
  });

  const tickets = data?.tickets || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'ticket_number', label: 'Ticket #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'subject', label: 'Subject', render: (v) => <span className="line-clamp-1 max-w-xs">{v}</span> },
    { key: 'company_name', label: 'Customer', render: (v, row) => row.customer_profiles?.company_name || v || '—' },
    { key: 'category', label: 'Category', render: (v) => v?.replace(/_/g,' ') || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Tickets from your customers" />
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
