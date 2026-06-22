import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { formatDate, formatCurrencyCompact } from '../../utils/format';
import { Plus, X } from 'lucide-react';

export default function AECollections() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company_name: '', amount: '', due_date: '', notes: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['collection-tasks', page],
    queryFn: () => api.get('/collection-tasks', { page, limit: 20 }),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/collection-tasks', d),
    onSuccess: () => { qc.invalidateQueries(['collection-tasks']); setShowForm(false); setForm({ company_name: '', amount: '', due_date: '', notes: '' }); },
  });

  const complete = useMutation({
    mutationFn: ({ id, resolution }) => api.patch(`/collection-tasks/${id}/complete`, { resolution }),
    onSuccess: () => qc.invalidateQueries(['collection-tasks']),
  });

  const tasks = data?.tasks || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Customer' },
    { key: 'amount', label: 'Amount Due', render: (v) => <span className="font-semibold text-red-600">{formatCurrencyCompact(v)}</span> },
    { key: 'due_date', label: 'Due Date', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {v || 'Open'}
      </span>
    )},
    { key: 'notes', label: 'Notes', render: (v) => <span className="truncate max-w-[200px] block text-text-muted text-xs">{v || '—'}</span> },
    { key: 'id', label: '', render: (v, row) => (
      row.status !== 'completed' && (
        <button onClick={(e) => { e.stopPropagation(); complete.mutate({ id: v, resolution: 'collected' }); }}
          className="text-xs text-green-600 hover:underline">Mark Collected</button>
      )
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Collection Tasks"
        subtitle="Track overdue accounts and collection follow-ups"
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700">
            <Plus className="w-4 h-4" /> New Task
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Create Collection Task</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); create.mutate({ ...form, amount: Number(form.amount) }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Customer *</label>
              <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Amount Due (₹) *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min={0}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Target Date *</label>
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
                {create.isPending ? 'Creating…' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={tasks} loading={isLoading} total={total} page={page} pageSize={20} onPageChange={setPage} emptyMessage="No collection tasks" />
    </div>
  );
}
