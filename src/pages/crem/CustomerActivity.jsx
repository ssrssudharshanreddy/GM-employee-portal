import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency, formatRelative } from '../../utils/format';
import { ShoppingCart, MessageSquare, MapPin, Phone, RotateCcw } from 'lucide-react';

export default function CREMCustomerActivity() {
  const [, params] = useRoute('/crem/customers/:id');
  const id = params?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`),
    enabled: !!id,
  });

  const { data: orders } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => api.get('/orders', { customer_id: id, limit: 5 }),
    enabled: !!id,
  });

  const { data: tickets } = useQuery({
    queryKey: ['customer-tickets', id],
    queryFn: () => api.get('/tickets', { customer_id: id, limit: 5 }),
    enabled: !!id,
  });

  const c = customer?.customer || customer;
  const recentOrders = orders?.orders || orders?.data || [];
  const recentTickets = tickets?.tickets || tickets?.data || [];

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!c) return <div className="text-center py-12 text-text-muted">Customer not found</div>;

  return (
    <div>
      <Link href="/crem/customers" className="text-sm text-brand-600 hover:underline">← My Customers</Link>
      <PageHeader
        title={c.company_name}
        subtitle={c.contact_person}
        actions={<StatusChip status={c.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold mb-3">Contact Information</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Phone', c.phone],
                ['Email', c.email],
                ['City', c.city || '—'],
                ['GSTIN', c.gstin || '—'],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-text-muted">{k}</dt><dd className="font-medium mt-0.5">{v}</dd></div>
              ))}
            </dl>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-semibold">Recent Orders</h2>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-xs text-text-muted">No orders</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-mono">{order.order_number}</p>
                      <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{formatCurrency(order.total_amount)}</span>
                      <StatusChip status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-semibold">Recent Tickets</h2>
            </div>
            {recentTickets.length === 0 ? (
              <p className="text-xs text-text-muted">No tickets</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {recentTickets.map(ticket => (
                  <Link key={ticket.id} href={`/crem/tickets/${ticket.id}`} className="flex items-center justify-between py-2 hover:bg-surface-50 -mx-1 px-1 rounded">
                      <p className="text-xs font-mono">{ticket.ticket_number}</p>
                      <p className="text-xs truncate max-w-[160px] mx-2">{ticket.subject}</p>
                      <StatusChip status={ticket.status} />
                    </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold mb-3">Account Summary</h2>
            {[
              ['Credit Limit', formatCurrency(c.credit_limit)],
              ['Outstanding', formatCurrency(c.outstanding_amount)],
              ['Credit Days', c.credit_days ? `${c.credit_days}d` : '—'],
              ['Last Visit', formatDate(c.last_visit_date)],
              ['Last Order', formatDate(c.last_order_date)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-xs">
                <span className="text-text-muted">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>

          <Link href={`/crem/visits?customer_id=${id}`} className="flex items-center gap-2 w-full p-3 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-100">
              <MapPin className="w-4 h-4" /> Log a Visit
            </Link>
          <Link href={`/crem/follow-ups?customer_id=${id}`} className="flex items-center gap-2 w-full p-3 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100">
              <Phone className="w-4 h-4" /> Log Follow-Up
            </Link>
          <Link href={`/crem/tickets?customer_id=${id}`} className="flex items-center gap-2 w-full p-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">
              <MessageSquare className="w-4 h-4" /> Raise Ticket
            </Link>
        </div>
      </div>
    </div>
  );
}
