import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatDateTime } from '../../utils/format';
import { useState } from 'react';
import FilterBar from '../../components/FilterBar';

export default function WEDeliveries() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', search, page],
    queryFn: () => api.get('/orders', { status: 'DISPATCHED', search, page, limit: 20 }),
  });

  const deliveries = data?.orders || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'order_number', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'ws_name', label: 'WS Staff' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'delivery_address', label: 'Address', render: (v) => <span className="truncate max-w-[200px] block text-xs">{v || '—'}</span> },
    { key: 'dispatched_at', label: 'Dispatched', render: (v) => v ? formatDateTime(v) : '—' },
  ];

  return (
    <div>
      <PageHeader title="Active Deliveries" subtitle="Orders currently in transit" />
      <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} className="mb-4" />
      <DataTable
        columns={columns}
        data={deliveries}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        emptyMessage="No active deliveries"
      />
    </div>
  );
}
