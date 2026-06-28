import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import StatusTimeline from '../../components/StatusTimeline';
import { formatDate } from '../../utils/format';
import ConfirmModal from '../../components/ConfirmModal';

const STEPS = [
  { status: 'REQUESTED', label: 'Requested by Customer' },
  { status: 'UNDER_REVIEW', label: 'Under Review' },
  { status: 'RETURN_APPROVED', label: 'Approved' },
  { status: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
  { status: 'COLLECTED', label: 'Collected' },
  { status: 'COMPLETED', label: 'Return Completed' },
];

export default function WEReturnReview() {
  const [, params] = useRoute('/we/returns/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [modal, setModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['return', id],
    queryFn: () => api.get(`/returns/${id}`),
    enabled: !!id,
  });

  const action = useMutation({
    mutationFn: ({ act, data }) => api.patch(`/returns/${id}/status`, { status: act === 'approve' ? 'RETURN_APPROVED' : 'RETURN_REJECTED', rejection_reason: data?.notes }),
    onSuccess: () => { qc.invalidateQueries(['return', id]); setModal(null); navigate('/we/returns'); },
  });

  const ret = data?.return || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!ret) return <div className="text-center py-12 text-text-muted">Return not found</div>;

  const isPending = ret.status === 'UNDER_REVIEW';

  return (
    <div>
      <Link href="/we/returns" className="text-sm text-brand-600 hover:underline">← Returns</Link>
      <PageHeader
        title={ret.return_number}
        subtitle={`${ret.company_name} · Requested ${formatDate(ret.created_at)}`}
        actions={
          isPending && (
            <div className="flex gap-2">
              <button onClick={() => setModal('reject')} className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200">Reject</button>
              <button onClick={() => setModal('approve')} className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700">Approve Return</button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Return Details</h2>
              <StatusChip status={ret.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Customer', ret.company_name],
                ['Order #', ret.order_number],
                ['Return Reason', ret.reason],
                ['Items', ret.item_count],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-text-muted">{k}</dt><dd className="font-medium mt-0.5">{v || '—'}</dd></div>
              ))}
            </dl>
            {ret.notes && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <p className="text-xs text-text-muted mb-1">Customer Description</p>
                <p className="text-sm">{ret.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Return Items</h2>
            {(ret.items || []).length === 0 ? (
              <p className="text-sm text-text-muted">No item details</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {(ret.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs font-mono text-text-muted">{item.product_code}</p>
                    </div>
                    <span className="text-sm">×{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5">
          <h2 className="text-sm font-semibold mb-4">Return Status</h2>
          <StatusTimeline steps={STEPS} currentStatus={ret.status} />
        </div>
      </div>

      <ConfirmModal open={modal === 'approve'} title="Approve Return"
        consequenceText="Approving this return will notify the customer and schedule pickup."
        confirmLabel="Approve Return"
        loading={loading} onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await action.mutateAsync({ act: 'approve' }); setLoading(false); }} />

      <ConfirmModal open={modal === 'reject'} title="Reject Return"
        consequenceText="Rejecting this return will notify the customer with your reason."
        confirmLabel="Reject Return" confirmVariant="danger"
        loading={loading} onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await action.mutateAsync({ act: 'reject', data: { notes } }); setLoading(false); }} />
    </div>
  );
}
