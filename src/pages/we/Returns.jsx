import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function WEReturns() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['we-returns', status, page],
    queryFn: () => api.get('/returns', { status: status || undefined, page, limit: 20 }),
  });

  const returns = data?.returns || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'return_number', label: 'Return #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'order_number', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'company_name', label: 'Customer' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'reason', label: 'Reason', render: (v) => <span className="truncate max-w-[160px] block text-xs">{v || '—'}</span> },
    { key: 'created_at', label: 'Requested', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="Return Requests" subtitle="Review and approve customer return requests" />
      <FilterBar
        className="mb-4"
        filters={[{ type: 'select', value: status, onChange: (v) => { setStatus(v); setPage(1); },
          placeholder: 'All Statuses',
          options: ['REQUESTED','UNDER_REVIEW','RETURN_APPROVED','PICKUP_SCHEDULED','COLLECTED','COMPLETED'].map(s => ({ value: s, label: s.replace(/_/g,' ') })) }]}
      />
      <DataTable
        columns={columns}
        data={returns}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/we/returns/${row.id}`)}
        emptyMessage="No returns found"
      />
    </div>
  );
}
