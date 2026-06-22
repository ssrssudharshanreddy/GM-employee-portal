import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatDate } from '../../utils/format';
import { CheckCircle, Circle, Plus, X } from 'lucide-react';

export default function CREMTasks() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', due_date: '', priority: 'MEDIUM' });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks', { limit: 50 }),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/tasks', d),
    onSuccess: () => { qc.invalidateQueries(['tasks']); setShowForm(false); setForm({ title: '', due_date: '', priority: 'MEDIUM' }); },
  });

  const complete = useMutation({
    mutationFn: (id) => api.patch(`/tasks/${id}/complete`, {}),
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });

  const tasks = data?.tasks || data?.data || [];
  const pending = tasks.filter(t => !t.completed_at);
  const done = tasks.filter(t => t.completed_at);

  const priorityColor = { HIGH: 'text-red-500', MEDIUM: 'text-amber-500', LOW: 'text-text-muted' };

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle="Personal task list and reminders"
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700">
            <Plus className="w-4 h-4" /> New Task
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">New Task</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="flex flex-wrap gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              placeholder="Task description *"
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
              {['HIGH','MEDIUM','LOW'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button type="submit" disabled={create.isPending} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md disabled:opacity-50">
              Add
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-surface-200">
          <h2 className="text-sm font-semibold text-text-primary">Pending ({pending.length})</h2>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-surface-100 animate-pulse rounded" />)}</div>
        ) : pending.length === 0 ? (
          <div className="p-6 text-center text-sm text-text-muted">All tasks complete!</div>
        ) : (
          pending.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 hover:bg-surface-50">
              <button onClick={() => complete.mutate(task.id)} className="flex-shrink-0">
                <Circle className={`w-5 h-5 ${priorityColor[task.priority] || 'text-text-muted'}`} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{task.title}</p>
                {task.due_date && <p className="text-xs text-text-muted">{formatDate(task.due_date)}</p>}
              </div>
              <span className={`text-xs font-medium ${priorityColor[task.priority] || ''}`}>{task.priority}</span>
            </div>
          ))
        )}

        {done.length > 0 && (
          <>
            <div className="p-4 border-t border-b border-surface-200 bg-surface-50">
              <h2 className="text-sm font-semibold text-text-muted">Completed ({done.length})</h2>
            </div>
            {done.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 opacity-60">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm line-through text-text-muted">{task.title}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
