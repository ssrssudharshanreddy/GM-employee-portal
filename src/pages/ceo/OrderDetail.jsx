import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import StatusTimeline from '../../components/StatusTimeline';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/format';

const ORDER_STEPS = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'CONFIRMED', label: 'Confirmed by WE' },
  { status: 'PICKING', label: 'Picking' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'DISPATCHED', label: 'Dispatched' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export default function CEOOrderDetail() {
  const [, params] = useRoute('/ceo/orders/:id');
  const id = params?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`),
    enabled: !!id,
  });

  const order = data?.order || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!order) return <div className="text-center py-12 text-text-muted">Order not found</div>;

  const items = order.items || order.order_items || [];

  return (
    <div>
      <Link href="/ceo/orders"><a className="text-sm text-brand-600 hover:underline">← Orders</a></Link>
      <PageHeader
        title={order.order_number}
        subtitle={`Placed on ${formatDate(order.created_at)}`}
        actions={<StatusChip status={order.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold text-text-primary mb-3">Customer</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-text-muted">Company</dt><dd className="font-medium">{order.company_name || '—'}</dd></div>
              <div><dt className="text-text-muted">Contact</dt><dd className="font-medium">{order.contact_person || '—'}</dd></div>
              <div className="col-span-2"><dt className="text-text-muted">Delivery Address</dt><dd className="font-medium">{order.delivery_address || '—'}</dd></div>
            </dl>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">Order Items</h2>
            <div className="divide-y divide-surface-200">
              {items.map((item, i) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{item.product_name}</p>
                    <p className="text-xs text-text-muted font-mono">{item.product_code}</p>
                  </div>
                  <div className="text-sm text-text-secondary">×{item.quantity} {item.unit}</div>
                  <div className="text-sm font-medium text-right">
                    <div>{formatCurrency(item.unit_price)}</div>
                    <div className="text-xs text-text-muted">GST {item.gst_percent}%</div>
                  </div>
                  <div className="text-sm font-semibold w-24 text-right">{formatCurrency(item.total_amount)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-surface-200 mt-4 pt-4 space-y-2">
              {[
                ['Subtotal', order.subtotal_amount],
                ['GST', order.gst_amount],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-text-muted">{label}</span>
                  <span>{formatCurrency(val)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold border-t border-surface-200 pt-2">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Order Timeline</h2>
            <StatusTimeline steps={ORDER_STEPS} currentStatus={order.status} />
          </div>

          {/* WS Info */}
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Fulfillment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Assigned WS</span>
                <span className="font-medium">{order.ws_name || '—'}</span>
              </div>
              {order.dispatched_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Dispatched</span>
                  <span className="font-medium">{formatDateTime(order.dispatched_at)}</span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Delivered</span>
                  <span className="font-medium">{formatDateTime(order.delivered_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
