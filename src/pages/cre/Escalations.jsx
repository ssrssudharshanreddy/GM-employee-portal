import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function CREEscalations() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['escalations'],
    queryFn: () => api.get('/tickets', { status: 'ESCALATED', limit: 30 }),
  });

  const tickets = data?.tickets || data?.data || [];
  const total = data?.total || tickets.length;

  const columns = [
    { key: 'ticket_number', label: 'Ticket #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'subject', label: 'Subject', render: (v) => <span className="truncate max-w-xs block">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'crem_name', label: 'Raised By' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Escalation Center" subtitle="Tickets escalated from your CREMs" />
      <DataTable
        columns={columns}
        data={tickets}
        loading={isLoading}
        total={total}
        emptyMessage="No escalations"
        onRowClick={(row) => navigate(`/crem/tickets/${row.id}`)}
      />
    </div>
  );
}
