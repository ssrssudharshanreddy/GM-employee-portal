import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';
import { Plus, X } from 'lucide-react';

export default function CREMVisits() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company_name: '', visit_type: 'SITE_VISIT', scheduled_date: '', notes: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['visits', search, page],
    queryFn: () => api.get('/visits', { search, page, limit: 20 }),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/visits', d),
    onSuccess: () => {
      qc.invalidateQueries(['visits']);
      setShowForm(false);
      setForm({ company_name: '', visit_type: 'SITE_VISIT', scheduled_date: '', notes: '' });
    },
  });

  const complete = useMutation({
    mutationFn: ({ id, outcome }) => api.patch(`/visits/${id}/complete`, { outcome }),
    onSuccess: () => qc.invalidateQueries(['visits']),
  });

  const visits = data?.visits || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'visit_type', label: 'Type', render: (v) => v?.replace(/_/g,' ') || '—' },
    { key: 'scheduled_date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v || 'SCHEDULED'} /> },
    { key: 'outcome', label: 'Outcome', render: (v) => v || '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Customer Visits"
        subtitle="Schedule and record customer visits"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700"
          >
            <Plus className="w-4 h-4" /> Log Visit
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Log a Visit</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Customer Name *</label>
              <input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Visit Type</label>
              <select
                value={form.visit_type}
                onChange={(e) => setForm({ ...form, visit_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {['SITE_VISIT','ONBOARDING','COLLECTION','RELATIONSHIP'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Scheduled Date *</label>
              <input
                type="datetime-local"
                value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={create.isPending}
                className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
              >
                {create.isPending ? 'Saving…' : 'Save Visit'}
              </button>
            </div>
          </form>
        </div>
      )}

      <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} className="mb-4" />
      <DataTable
        columns={columns}
        data={visits}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        emptyMessage="No visits"
      />
    </div>
  );
}
