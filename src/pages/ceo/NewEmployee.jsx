import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';

const ROLES = ['CRE','CREM','AE','WE','WS'];

export default function CEONewEmployee() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: '', email: '', role: '', phone: '', department: '' });
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: (data) => api.post('/employees', data),
    onSuccess: (data) => {
      qc.invalidateQueries(['employees']);
      navigate(`/ceo/employees/${data?.employee?.id || data?.id}`);
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.role) { setError('Please select a role.'); return; }
    create.mutate(form);
  }

  return (
    <div>
      <Link href="/ceo/employees"><a className="text-sm text-brand-600 hover:underline">← Employees</a></Link>
      <PageHeader title="Create Employee" subtitle="Add a new employee to the system" />

      <div className="max-w-lg bg-white rounded-lg shadow-card p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'full_name', label: 'Full Name', required: true, type: 'text' },
            { key: 'email', label: 'Email Address', required: true, type: 'email' },
            { key: 'phone', label: 'Phone Number', type: 'tel' },
            { key: 'department', label: 'Department', type: 'text' },
          ].map(({ key, label, required, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {label}{required && ' *'}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select a role…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
            >
              {create.isPending ? 'Creating…' : 'Create Employee'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/ceo/employees')}
              className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md hover:bg-surface-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
