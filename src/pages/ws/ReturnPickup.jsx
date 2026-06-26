import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import PINInput from '../../components/PINInput';
import StatusTimeline from '../../components/StatusTimeline';
import { formatDate } from '../../utils/format';
import { MapPin, Package } from 'lucide-react';

const STEPS = [
  { status: 'RETURN_APPROVED', label: 'Return Approved' },
  { status: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
  { status: 'COLLECTED', label: 'Items Collected' },
  { status: 'COMPLETED', label: 'Return Complete' },
];

export default function WSReturnPickup() {
  const [, params] = useRoute('/ws/returns/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['return', id],
    queryFn: () => api.get(`/returns/${id}`),
    enabled: !!id,
  });

  const confirmPickup = useMutation({
    mutationFn: (return_pin) => api.post(`/returns/${id}/collect`, { return_pin }),
    onSuccess: () => { qc.invalidateQueries(['return', id]); navigate('/ws/returns'); },
    onError: (err) => { setPinError(err.message || 'Invalid PIN'); setPin(''); },
  });

  const ret = data?.return || data;
  const items = ret?.items || [];

  if (isLoading) return <div className="animate-pulse"><div className="h-64 bg-surface-100 rounded-lg" /></div>;
  if (!ret) return <div className="text-center py-12 text-text-muted">Return not found</div>;

  const isScheduled = ret.status === 'PICKUP_SCHEDULED';

  return (
    <div>
      <Link href="/ws/returns" className="text-sm text-brand-600 hover:underline">← My Returns</Link>
      <PageHeader
        title={ret.return_number}
        subtitle={ret.company_name}
        actions={<StatusChip status={ret.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pickup Address */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Pickup Information</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Pickup Address</p>
                <p className="text-sm text-text-secondary">{ret.pickup_address || ret.delivery_address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Items to collect */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold">Items to Collect</h2>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-text-muted">No item details</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs font-mono text-text-muted">{item.product_code}</p>
                    </div>
                    <span className="text-sm font-semibold">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PIN Entry */}
          {isScheduled && (
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="text-base font-semibold mb-2">Confirm Pickup</h2>
              <p className="text-sm text-text-secondary mb-6">
                Ask the customer for their 6-digit Return PIN to confirm you've collected the items.
              </p>

              {!showPinEntry ? (
                <button
                  onClick={() => setShowPinEntry(true)}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold rounded-lg transition-colors"
                >
                  Enter Return PIN
                </button>
              ) : (
                <div className="space-y-6">
                  <PINInput length={6} onComplete={setPin} error={pinError} />
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => { setShowPinEntry(false); setPinError(''); setPin(''); }}
                      className="px-6 py-2.5 text-sm font-medium bg-surface-100 text-text-secondary rounded-md">
                      Cancel
                    </button>
                    <button
                      onClick={() => pin.length === 6 && confirmPickup.mutate(pin)}
                      disabled={pin.length < 6 || confirmPickup.isPending}
                      className="px-6 py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                    >
                      {confirmPickup.isPending ? 'Confirming…' : 'Confirm Pickup'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {ret.status === 'COLLECTED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700 font-semibold">✓ Items Collected</p>
              <p className="text-green-600 text-sm mt-1">Return pickup confirmed on {formatDate(ret.collected_at)}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-4">Return Status</h2>
          <StatusTimeline steps={STEPS} currentStatus={ret.status} />
          <div className="mt-4 pt-4 border-t border-surface-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Order #</span>
              <span className="font-mono text-xs">{ret.order_number || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Reason</span>
              <span className="text-right max-w-[120px] text-xs">{ret.reason || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Requested</span>
              <span>{formatDate(ret.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
