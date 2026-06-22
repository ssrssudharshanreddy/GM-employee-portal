import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/format';
import ConfirmModal from '../../components/ConfirmModal';

export default function AECreditManagement() {
  const [, params] = useRoute('/ae/customers/:id/credit');
  const id = params?.id;
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}`);
      const c = res?.customer || res;
      setForm({ credit_limit: c?.credit_limit || '', credit_days: c?.credit_days || '' });
      return res;
    },
    enabled: !!id,
  });

  const updateCredit = useMutation({
    mutationFn: (d) => api.patch(`/customers/${id}/credit`, d),
    onSuccess: () => { qc.invalidateQueries(['customer', id]); setSuccess('Credit terms updated.'); setModal(null); },
    onError: (err) => setError(err.message),
  });

  const freezeCredit = useMutation({
    mutationFn: () => api.post(`/customers/${id}/freeze-credit`, {}),
    onSuccess: () => { qc.invalidateQueries(['customer', id]); setModal(null); },
  });

  const unfreezeCredit = useMutation({
    mutationFn: () => api.post(`/customers/${id}/unfreeze-credit`, {}),
    onSuccess: () => { qc.invalidateQueries(['customer', id]); setModal(null); },
  });

  const c = data?.customer || data;

  if (isLoading || !form) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;

  return (
    <div>
      <Link href={`/ae/customers/${id}`}><a className="text-sm text-brand-600 hover:underline">← Customer Profile</a></Link>
      <PageHeader title="Credit Management" subtitle={c?.company_name} />

      <div className="max-w-2xl space-y-6">
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Current Credit Status</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Credit Limit', formatCurrency(c?.credit_limit)],
              ['Credit Days', c?.credit_days ? `${c.credit_days} days` : '—'],
              ['Used Credit', formatCurrency(c?.used_credit)],
              ['Available', formatCurrency((c?.credit_limit || 0) - (c?.used_credit || 0))],
            ].map(([k, v]) => (
              <div key={k} className="p-3 bg-surface-50 rounded-lg">
                <p className="text-xs text-text-muted">{k}</p>
                <p className="text-lg font-semibold mt-1">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Update Terms */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Update Credit Terms</h2>
          <form onSubmit={(e) => { e.preventDefault(); setModal('update'); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Credit Limit (₹) *</label>
                <input type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: e.target.value })} min={0}
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Credit Days *</label>
                <select value={form.credit_days} onChange={(e) => setForm({ ...form, credit_days: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {[7, 14, 21, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700">
              Update Credit Terms
            </button>
          </form>
        </div>

        {/* Freeze / Unfreeze */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-2">Credit Freeze</h2>
          <p className="text-sm text-text-secondary mb-4">Freezing credit prevents the customer from placing new orders.</p>
          <div className="flex gap-3">
            <button onClick={() => setModal('freeze')} className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200">
              Freeze Credit
            </button>
            <button onClick={() => setModal('unfreeze')} className="px-4 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200">
              Unfreeze Credit
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal open={modal === 'update'} title="Update Credit Terms"
        consequenceText="This will update the credit limit and payment terms for this customer."
        confirmLabel="Yes, Update" loading={loading} onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await updateCredit.mutateAsync({ credit_limit: Number(form.credit_limit), credit_days: Number(form.credit_days) }); setLoading(false); }} />
      <ConfirmModal open={modal === 'freeze'} title="Freeze Credit"
        consequenceText="Customer cannot place orders until credit is unfrozen." confirmLabel="Freeze" confirmVariant="danger" loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await freezeCredit.mutateAsync(); setLoading(false); }} />
      <ConfirmModal open={modal === 'unfreeze'} title="Unfreeze Credit"
        consequenceText="Customer will be able to place orders again." confirmLabel="Unfreeze" loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await unfreezeCredit.mutateAsync(); setLoading(false); }} />
    </div>
  );
}
