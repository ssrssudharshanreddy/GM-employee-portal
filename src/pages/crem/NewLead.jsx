import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';

export default function CREMNewLead() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [form, setForm] = useState({ company_name: '', contact_person: '', phone: '', email: '', source: '', city: '' });
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: (data) => api.post('/leads', data),
    onSuccess: (data) => {
      qc.invalidateQueries(['leads']);
      navigate(`/crem/leads/${data?.lead?.id || data?.id}`);
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    create.mutate(form);
  }

  return (
    <div>
      <Link href="/crem/leads" className="text-sm text-brand-600 hover:underline">← Leads</Link>
      <PageHeader title="Create Lead" subtitle="Add a new lead to the system" />

      <div className="max-w-lg bg-white rounded-lg shadow-card p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'company_name', label: 'Company Name', required: true, type: 'text' },
            { key: 'contact_person', label: 'Contact Person', required: true, type: 'text' },
            { key: 'phone', label: 'Phone Number', type: 'tel' },
            { key: 'email', label: 'Email Address', type: 'email' },
            { key: 'source', label: 'Source', type: 'text', placeholder: 'e.g. Website, Referral' },
            { key: 'city', label: 'City', type: 'text' },
          ].map(({ key, label, required, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {label}{required && ' *'}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
            >
              {create.isPending ? 'Creating…' : 'Create Lead'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/crem/leads')}
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
