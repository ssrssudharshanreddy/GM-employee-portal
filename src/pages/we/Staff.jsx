import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { formatNumber } from '../../utils/format';

export default function WEStaff() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['ws-staff'],
    queryFn: () => api.get('/employees', { role: 'WS' }),
  });

  const staff = data?.data ?? [];
  const total = data?.total ?? staff.length;

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'deliveries_today', label: "Today's Deliveries", render: (v) => formatNumber(v) },
    { key: 'deliveries_total', label: 'Total Deliveries', render: (v) => formatNumber(v) },
  ];

  return (
    <div>
      <PageHeader title="WS Staff" subtitle="Warehouse Staff and their delivery assignments" />
      <DataTable
        columns={columns}
        data={staff}
        loading={isLoading}
        total={total}
        emptyMessage="No WS staff found"
        onRowClick={(row) => navigate(`/we/staff/${row.id}`)}
      />
    </div>
  );
}
