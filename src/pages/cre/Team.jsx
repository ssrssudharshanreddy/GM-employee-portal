import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { formatPercent } from '../../utils/format';

export default function CRETeam() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['cre-team'],
    queryFn: () => api.get('/employees', { role: 'CREM' }),
  });

  const crems = data?.data ?? [];
  const total = data?.total ?? crems.length;

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'customer_count', label: 'Customers', render: (v) => v ?? '—' },
    { key: 'open_tickets', label: 'Open Tickets', render: (v) => v ?? '—' },
    { key: 'sla_compliance', label: 'SLA %', render: (v) => formatPercent(v) },
  ];

  return (
    <div>
      <PageHeader title="My Team" subtitle="CREMs under your supervision" />
      <DataTable
        columns={columns}
        data={crems}
        loading={isLoading}
        total={total}
        emptyMessage="No CREMs found"
        onRowClick={(row) => navigate(`/cre/team/${row.id}`)}
      />
    </div>
  );
}
