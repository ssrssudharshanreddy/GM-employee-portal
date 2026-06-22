import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

export default function AEApplicationDetail() {
  const [, params] = useRoute('/ae/applications/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ credit_limit: '', credit_days: '', notes: '' });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.get(`/applications/${id}`),
    enabled: !!id,
  });

  const setupCredit = useMutation({
    mutationFn: (d) => api.patch(`/applications/${id}/setup-credit`, d),
    onSuccess: () => { qc.invalidateQueries(['application', id]); navigate('/ae/applications'); },
    onError: (err) => setError(err.message),
  });

  const app = data?.application || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!app) return <div className="text-center py-12 text-text-muted">Application not found</div>;

  const canSetup = app.status === 'PENDING_ACCOUNTS_REVIEW';

  return (
    <div>
      <Link href="/ae/applications"><a className="text-sm text-brand-600 hover:underline">← Applications</a></Link>
      <PageHeader
        title={app.company_name}
        subtitle={`Credit setup for new customer`}
        actions={<StatusChip status={app.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Company Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Company', app.company_name],
                ['Contact', app.contact_person],
                ['Email', app.email],
                ['Phone', app.phone],
                ['GSTIN', app.gstin || '—'],
                ['City', app.city || '—'],
                ['Joined', formatDate(app.created_at)],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-text-muted">{k}</dt><dd className="font-medium mt-0.5">{v}</dd></div>
              ))}
            </dl>
          </div>

          {canSetup && (
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="text-base font-semibold mb-4">Configure Credit Terms</h2>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <form onSubmit={(e) => { e.preventDefault(); setupCredit.mutate({ credit_limit: Number(form.credit_limit), credit_days: Number(form.credit_days), notes: form.notes }); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Credit Limit (₹) *</label>
                    <input type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: e.target.value })} required min={0}
                      className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Credit Days *</label>
                    <select value={form.credit_days} onChange={(e) => setForm({ ...form, credit_days: e.target.value })} required
                      className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="">Select…</option>
                      {[7, 14, 21, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} days</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                    className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                </div>
                <button type="submit" disabled={setupCredit.isPending}
                  className="px-6 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                  {setupCredit.isPending ? 'Activating…' : 'Activate Customer Account'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-3">Requested Terms</h2>
          {[
            ['Credit Requested', app.credit_limit_requested ? `₹${Number(app.credit_limit_requested).toLocaleString('en-IN')}` : '—'],
            ['Days Requested', app.credit_days_requested ? `${app.credit_days_requested}d` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-muted">{k}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
