import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

const STATUS_OPTS = ['REQUESTED','UNDER_REVIEW','RETURN_APPROVED','COLLECTED','COMPLETED','REJECTED'].map(s => ({ value: s, label: s.replace(/_/g,' ') }));

export default function CEOReturns() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['returns', search, status, page],
    queryFn: () => api.get('/returns', { search, status: status || undefined, page, limit: 20 }),
  });

  const returns = data?.returns || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'return_number', label: 'Return #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'order_number', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'item_count', label: 'Items', render: (v) => v || '—' },
    { key: 'created_at', label: 'Requested', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="All Returns" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); }, placeholder: 'All Statuses', options: STATUS_OPTS }]}
      />
      <DataTable
        columns={columns}
        data={returns}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        emptyMessage="No returns found"
      />
    </div>
  );
}
