import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import PINInput from '../../components/PINInput';
import StatusTimeline from '../../components/StatusTimeline';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate, formatCurrency } from '../../utils/format';
import { MapPin, Phone, Package } from 'lucide-react';

const STEPS = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'DISPATCHED', label: 'Dispatched' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const NEXT_STATUS = {
  CONFIRMED: { status: 'PROCESSING', label: 'Start Processing', btnClass: 'bg-violet-600 text-white hover:bg-violet-700' },
  PROCESSING: { status: 'PACKED', label: 'Mark Packed', btnClass: 'bg-sky-600 text-white hover:bg-sky-700' },
  PACKED: { status: 'DISPATCHED', label: 'Dispatch Order', btnClass: 'bg-amber-600 text-white hover:bg-amber-700' },
  DISPATCHED: { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', btnClass: 'bg-orange-600 text-white hover:bg-orange-700' },
};

export default function WSOrderFulfillment() {
  const [, params] = useRoute('/ws/orders/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`),
    enabled: !!id,
  });

  const confirmDelivery = useMutation({
    mutationFn: (delivery_pin) => api.post(`/orders/${id}/deliver`, { delivery_pin }),
    onSuccess: () => { qc.invalidateQueries(['order', id]); navigate('/ws/orders'); },
    onError: (err) => { setPinError(err.message || 'Invalid PIN. Please try again.'); setPin(''); },
  });

  const statusAction = useMutation({
    mutationFn: ({ status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries(['order', id]); setModal(null); },
  });

  const order = data?.order || data;
  const items = order?.items || order?.order_items || [];

  if (isLoading) return <div className="animate-pulse"><div className="h-64 bg-surface-100 rounded-lg" /></div>;
  if (!order) return <div className="text-center py-12 text-text-muted">Order not found</div>;

  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const next = NEXT_STATUS[order.status];

  return (
    <div>
      <Link href="/ws/orders" className="text-sm text-brand-600 hover:underline">← My Orders</Link>
      <PageHeader
        title={order.order_number}
        subtitle={order.company_name}
        actions={
          <div className="flex gap-2 items-center">
            <StatusChip status={order.status} />
            {next && (
              <button onClick={() => setModal('advance')}
                className={`px-4 py-2 text-sm font-medium rounded-md ml-2 ${next.btnClass}`}>
                {next.label}
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Info */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Delivery Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Delivery Address</p>
                  <p className="text-sm text-text-secondary">{order.delivery_address || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Contact</p>
                  <p className="text-sm text-text-secondary">{order.contact_person} · {order.phone || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-semibold">Items to Deliver</h2>
            </div>
            <div className="divide-y divide-surface-200">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs font-mono text-text-muted">{item.product_code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{item.quantity} {item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-200 pt-3 mt-3 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {/* PIN Entry for delivery */}
          {isOutForDelivery && (
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="text-base font-semibold mb-2">Confirm Delivery</h2>
              <p className="text-sm text-text-secondary mb-6">
                Ask the customer for their 6-digit Delivery PIN to confirm this delivery.
              </p>

              {!showPinEntry ? (
                <button
                  onClick={() => setShowPinEntry(true)}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-lg transition-colors"
                >
                  Enter Delivery PIN
                </button>
              ) : (
                <div className="space-y-6">
                  <PINInput
                    length={6}
                    onComplete={(p) => setPin(p)}
                    error={pinError}
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => { setShowPinEntry(false); setPinError(''); setPin(''); }}
                      className="px-6 py-2.5 text-sm font-medium bg-surface-100 text-text-secondary rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (pin.length === 6) {
                          setPinError('');
                          confirmDelivery.mutate(pin);
                        }
                      }}
                      disabled={pin.length < 6 || confirmDelivery.isPending}
                      className="px-6 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {confirmDelivery.isPending ? 'Confirming…' : 'Confirm Delivery'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {order.status === 'DELIVERED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700 font-semibold">✓ Delivered Successfully</p>
              <p className="text-green-600 text-sm mt-1">This order was delivered on {formatDate(order.delivered_at)}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-4">Delivery Status</h2>
          <StatusTimeline steps={STEPS} currentStatus={order.status} />
          <div className="mt-4 pt-4 border-t border-surface-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Order Date</span>
              <span className="font-medium">{formatDate(order.created_at)}</span>
            </div>
            {order.dispatched_at && (
              <div className="flex justify-between">
                <span className="text-text-muted">Dispatched</span>
                <span className="font-medium">{formatDate(order.dispatched_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modal === 'advance'}
        title={next?.label || ''}
        consequenceText={`This will advance the order to the next stage.`}
        confirmLabel={next?.label}
        loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await statusAction.mutateAsync({ status: next.status }); setLoading(false); }}
      />
    </div>
  );
}
