import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import StatusTimeline from '../../components/StatusTimeline';
import { formatDate, formatCurrency } from '../../utils/format';
import ConfirmModal from '../../components/ConfirmModal';

const STEPS = [
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'DISPATCHED', label: 'Dispatched' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export default function WEOrderDetail() {
  const [, params] = useRoute('/we/orders/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [wsId, setWsId] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`),
    enabled: !!id,
  });

  const { data: wsStaff } = useQuery({
    queryKey: ['ws-staff'],
    queryFn: () => api.get('/employees', { role: 'WS', status: 'ACTIVE' }),
  });

  const assign = useMutation({
    // Send both current status and assigned_ws_id since the schema requires status
    mutationFn: (ws_id) => api.patch(`/orders/${id}/status`, { status: order?.status, assigned_ws_id: ws_id }),
    onSuccess: () => { qc.invalidateQueries(['order', id]); },
  });

  const order = data?.order || data;
  const items = order?.items || order?.order_items || [];
  const staff = wsStaff?.employees || wsStaff?.data || [];

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!order) return <div className="text-center py-12 text-text-muted">Order not found</div>;

  return (
    <div>
      <Link href="/we/orders" className="text-sm text-brand-600 hover:underline">← Orders</Link>
      <PageHeader
        title={order.order_number}
        subtitle={`${order.company_name} · ${formatDate(order.created_at)}`}
        actions={
          <div className="flex gap-2">
            {!order.ws_id && (
              <button onClick={() => setModal('assign')} className="px-4 py-2 text-sm font-medium border border-surface-200 rounded-md hover:bg-surface-100 text-text-secondary">
                Assign WS
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Order Items</h2>
              <StatusChip status={order.status} />
            </div>
            <div className="divide-y divide-surface-200">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs font-mono text-text-muted">{item.product_code}</p>
                  </div>
                  <span className="text-sm">×{item.quantity} {item.unit}</span>
                  <span className="text-sm font-semibold">{formatCurrency(item.total_amount)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-200 pt-4 mt-4 flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold mb-4">Order Progress</h2>
            <StatusTimeline steps={STEPS} currentStatus={order.status} />
          </div>

          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold mb-3">Assignment</h2>
            <div className="flex justify-between text-sm py-1">
              <span className="text-text-muted">Assigned WS</span>
              <span className="font-medium">{order.ws_name || 'Unassigned'}</span>
            </div>
            {order.ws_id && (
              <div className="flex justify-between text-sm py-1">
                <span className="text-text-muted">Delivery Address</span>
                <span className="font-medium text-right text-xs max-w-[150px]">{order.delivery_address || '—'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === 'assign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md p-6">
            <h3 className="text-base font-semibold mb-4">Assign WS Staff</h3>
            <select value={wsId} onChange={(e) => setWsId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4">
              <option value="">Select WS staff…</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md">Cancel</button>
              <button
                onClick={async () => { if (wsId) { setLoading(true); await assign.mutateAsync(wsId); setLoading(false); setModal(null); } }}
                disabled={!wsId || loading}
                className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
