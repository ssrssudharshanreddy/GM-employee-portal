import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function WSReturns() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['ws-my-returns'],
    queryFn: () => api.get('/returns', { my_returns: true, limit: 50 }),
  });

  const returns = data?.returns || data?.data || [];
  const total = data?.total || returns.length;

  const columns = [
    { key: 'return_number', label: 'Return #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'order_number', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'pickup_address', label: 'Pickup Address', render: (v) => <span className="text-xs">{v || '—'}</span> },
    { key: 'created_at', label: 'Requested', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="My Return Pickups" subtitle="Return pickups assigned to you" />
      <DataTable
        columns={columns}
        data={returns}
        loading={isLoading}
        total={total}
        emptyMessage="No return pickups assigned"
        onRowClick={(row) => navigate(`/ws/returns/${row.id}`)}
      />
    </div>
  );
}
