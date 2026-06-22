import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { formatDate } from '../../utils/format';
import { Plus, X } from 'lucide-react';

export default function CREMFollowUps() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company_name: '', channel: 'PHONE', due_date: '', notes: '' });
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['follow-ups', page],
    queryFn: () => api.get('/follow-ups', { page, limit: 20 }),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/follow-ups', d),
    onSuccess: () => { qc.invalidateQueries(['follow-ups']); setShowForm(false); setForm({ company_name: '', channel: 'PHONE', due_date: '', notes: '' }); },
  });

  const complete = useMutation({
    mutationFn: (id) => api.patch(`/follow-ups/${id}/complete`, {}),
    onSuccess: () => qc.invalidateQueries(['follow-ups']),
  });

  const followUps = data?.follow_ups || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Customer' },
    { key: 'channel', label: 'Channel', render: (v) => v || '—' },
    { key: 'due_date', label: 'Due', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {v || 'Pending'}
      </span>
    )},
    { key: 'notes', label: 'Notes', render: (v) => <span className="truncate max-w-[160px] block text-text-muted">{v || '—'}</span> },
    { key: 'id', label: '', render: (v, row) => (
      row.status !== 'completed' && (
        <button onClick={(e) => { e.stopPropagation(); complete.mutate(v); }} className="text-xs text-green-600 hover:underline">Mark Done</button>
      )
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Follow-Ups"
        subtitle="Scheduled follow-up calls and interactions"
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700">
            <Plus className="w-4 h-4" /> Log Follow-Up
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Log Follow-Up</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Customer *</label>
              <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Channel</label>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
                {['PHONE','EMAIL','WHATSAPP','IN_PERSON'].map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Due Date *</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={create.isPending} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md disabled:opacity-50">
                {create.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={followUps} loading={isLoading} total={total} page={page} pageSize={20} onPageChange={setPage} emptyMessage="No follow-ups" />
    </div>
  );
}
