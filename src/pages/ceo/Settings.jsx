import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';

export default function CEOSettings() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => api.get('/system-settings'),
  });

  const save = useMutation({
    mutationFn: (values) => api.patch('/system-settings', values),
    onSuccess: () => {
      qc.invalidateQueries(['system-settings']);
      setEditing(false);
      setSuccess('Settings saved.');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => setError(err.message),
  });

  const settings = data?.settings || data || {};

  function startEdit() {
    setForm({ ...settings });
    setEditing(true);
    setError('');
  }

  const settingFields = [
    { key: 'return_window_days', label: 'Return Window (days)', type: 'number' },
    { key: 'max_pin_attempts', label: 'Max PIN Attempts', type: 'number' },
    { key: 'sla_ticket_hours', label: 'Ticket SLA (hours)', type: 'number' },
    { key: 'sla_delivery_hours', label: 'Delivery SLA (hours)', type: 'number' },
    { key: 'reorder_threshold_default', label: 'Default Reorder Threshold', type: 'number' },
    { key: 'revenue_target_monthly', label: 'Monthly Revenue Target (₹)', type: 'number' },
  ];

  return (
    <div>
      <PageHeader
        title="System Settings"
        subtitle="Configure SLA thresholds, return windows, and business rules"
        actions={!editing && (
          <button onClick={startEdit} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700">
            Edit Settings
          </button>
        )}
      />

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <div className="max-w-2xl bg-white rounded-lg shadow-card p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-surface-100 animate-pulse rounded" />)}
          </div>
        ) : editing ? (
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {settingFields.map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key] ?? ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={save.isPending} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50">
                {save.isPending ? 'Saving…' : 'Save Settings'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            {settingFields.map(({ key, label }) => (
              <div key={key} className="flex justify-between py-2 border-b border-surface-100 last:border-0">
                <dt className="text-sm text-text-muted">{label}</dt>
                <dd className="text-sm font-semibold text-text-primary">{settings[key] ?? '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
