import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency } from '../../utils/format';

const STATUS_OPTS = ['CONFIRMED','PICKING','PICKED','PACKING','PACKED','DISPATCHED'].map(s => ({ value: s, label: s }));

export default function WEOrders() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['we-orders', search, status, page],
    queryFn: () => api.get('/orders', { search, status: status || undefined, page, limit: 20 }),
  });

  const orders = data?.orders || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'order_number', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'item_count', label: 'Items' },
    { key: 'total_amount', label: 'Total', render: (v) => formatCurrency(v) },
    { key: 'ws_name', label: 'Assigned WS', render: (v) => v || 'Unassigned' },
    { key: 'created_at', label: 'Date', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Order Fulfillment Queue" subtitle="Orders ready for picking and dispatch" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); }, placeholder: 'All Statuses', options: STATUS_OPTS }]}
      />
      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/we/orders/${row.id}`)}
        emptyMessage="No orders found"
      />
    </div>
  );
}
