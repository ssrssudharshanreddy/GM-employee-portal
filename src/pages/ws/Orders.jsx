import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function WSOrders() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['ws-my-orders', status],
    queryFn: () => api.get('/orders', { my_orders: true, status: status || undefined, limit: 50 }),
  });

  const orders = data?.orders || data?.data || [];
  const total = data?.total || orders.length;

  const columns = [
    { key: 'order_number', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'delivery_address', label: 'Address', render: (v) => <span className="truncate max-w-[200px] block text-xs">{v || '—'}</span> },
    { key: 'created_at', label: 'Date', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="My Orders" subtitle="Deliveries assigned to you" />
      <FilterBar
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: setStatus,
          placeholder: 'All Statuses',
          options: ['DISPATCHED','DELIVERED','CANCELLED'].map(s => ({ value: s, label: s })) }]}
      />
      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        total={total}
        emptyMessage="No orders assigned to you"
        onRowClick={(row) => navigate(`/ws/orders/${row.id}`)}
      />
    </div>
  );
}
