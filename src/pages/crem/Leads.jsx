import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';
import { Plus } from 'lucide-react';

const STAGE_OPTS = ['NEW','CONTACTED','FOLLOW_UP','CONVERTED','LOST'].map(s => ({ value: s, label: s }));

export default function CREMLeads() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', search, stage, page],
    queryFn: () => api.get('/leads', { search, stage: stage || undefined, page, limit: 20 }),
  });

  const leads = data?.leads || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'phone', label: 'Phone' },
    { key: 'stage', label: 'Stage', render: (v) => <StatusChip status={v} /> },
    { key: 'source', label: 'Source', render: (v) => v?.replace(/_/g,' ') || '—' },
    { key: 'next_follow_up', label: 'Next Follow-Up', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Prospects in your pipeline"
        actions={
          <button
            onClick={() => navigate('/crem/leads/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        }
      />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ type: 'select', value: stage, onChange: (v) => { setStage(v); setPage(1); }, placeholder: 'All Stages', options: STAGE_OPTS }]}
      />
      <DataTable
        columns={columns}
        data={leads}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/crem/leads/${row.id}`)}
        emptyMessage="No leads found"
      />
    </div>
  );
}
