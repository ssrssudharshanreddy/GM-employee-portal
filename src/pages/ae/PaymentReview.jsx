import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/format';
import ConfirmModal from '../../components/ConfirmModal';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AEPaymentReview() {
  const [, params] = useRoute('/ae/payments/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => api.get(`/payments/${id}`),
    enabled: !!id,
  });

  const verify = useMutation({
    mutationFn: () => api.post(`/payments/${id}/verify`, {}),
    onSuccess: () => { qc.invalidateQueries(['payment', id]); navigate('/ae/payments'); },
  });

  const reject = useMutation({
    mutationFn: (reason) => api.post(`/payments/${id}/reject`, { reason }),
    onSuccess: () => { qc.invalidateQueries(['payment', id]); navigate('/ae/payments'); },
  });

  const payment = data?.payment || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!payment) return <div className="text-center py-12 text-text-muted">Payment not found</div>;

  const isPending = payment.status === 'PENDING_VERIFICATION';

  return (
    <div>
      <Link href="/ae/payments" className="text-sm text-brand-600 hover:underline">← Payments</Link>
      <PageHeader
        title={`Payment from ${payment.company_name}`}
        subtitle={formatDateTime(payment.created_at)}
        actions={
          isPending && (
            <div className="flex gap-2">
              <button onClick={() => setModal('reject')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => setModal('verify')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700">
                <CheckCircle className="w-4 h-4" /> Verify Payment
              </button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Payment Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Customer', payment.company_name],
                ['Amount', formatCurrency(payment.amount)],
                ['Method', payment.payment_method?.replace(/_/g, ' ')],
                ['Reference No.', payment.reference_number || '—'],
                ['Bank/UPI', payment.bank_name || payment.upi_id || '—'],
                ['Payment Date', formatDate(payment.payment_date)],
                ['Status', <StatusChip status={payment.status} />],
                ['Invoice(s)', payment.invoice_numbers || '—'],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-text-muted">{k}</dt><dd className="font-medium mt-0.5">{v}</dd></div>
              ))}
            </dl>
          </div>

          {/* Proof of payment */}
          {payment.proof_url && (
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="text-base font-semibold mb-4">Proof of Payment</h2>
              <img src={payment.proof_url} alt="Payment proof" className="max-w-full rounded-lg border border-surface-200" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-3">Summary</h2>
          <div className="text-center py-6">
            <p className="text-3xl font-bold font-mono text-text-primary">{formatCurrency(payment.amount)}</p>
            <StatusChip status={payment.status} className="mt-2" />
          </div>
          {payment.rejected_reason && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <p className="text-xs font-medium text-red-700">Rejection Reason:</p>
              <p className="text-xs text-red-600 mt-1">{payment.rejected_reason}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modal === 'verify'}
        title="Verify Payment"
        consequenceText={`Confirming this payment of ${formatCurrency(payment.amount)} from ${payment.company_name} will update their outstanding balance.`}
        confirmLabel="Yes, Verify"
        loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await verify.mutateAsync(); setLoading(false); }}
      />

      {modal === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md p-6">
            <h3 className="text-base font-semibold mb-3">Reject Payment</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (required)…"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md">Cancel</button>
              <button
                onClick={async () => { setLoading(true); await reject.mutateAsync(reason); setLoading(false); }}
                disabled={!reason.trim() || loading}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Rejecting…' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
