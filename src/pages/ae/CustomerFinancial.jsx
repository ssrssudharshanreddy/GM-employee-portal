import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency, formatCurrencyCompact } from '../../utils/format';

export default function AECustomerFinancial() {
  const [, params] = useRoute('/ae/customers/:id');
  const id = params?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`),
    enabled: !!id,
  });

  const { data: invoices } = useQuery({
    queryKey: ['customer-invoices', id],
    queryFn: () => api.get('/invoices', { customer_id: id, limit: 5 }),
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ['customer-payments', id],
    queryFn: () => api.get('/payments', { customer_id: id, limit: 5 }),
    enabled: !!id,
  });

  const c = customer?.customer || customer;
  const recentInvoices = invoices?.invoices || invoices?.data || [];
  const recentPayments = payments?.payments || payments?.data || [];

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!c) return <div className="text-center py-12 text-text-muted">Customer not found</div>;

  return (
    <div>
      <Link href="/ae/customers" className="text-sm text-brand-600 hover:underline">← Customers</Link>
      <PageHeader title={c.company_name} subtitle="Financial profile and credit management" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Recent Invoices</h2>
              <Link href="/ae/invoices" className="text-xs text-brand-600 hover:underline">All invoices</Link>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-text-muted">No invoices</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {recentInvoices.map(inv => (
                  <Link key={inv.id} href={`/ae/invoices/${inv.id}`} className="flex items-center justify-between py-3 hover:bg-surface-50 -mx-1 px-1 rounded">
                      <div>
                        <p className="text-xs font-mono">{inv.invoice_number}</p>
                        <p className="text-xs text-text-muted">Due {formatDate(inv.due_date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatCurrency(inv.total_amount)}</span>
                        <StatusChip status={inv.status} />
                      </div>
                    </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Recent Payments</h2>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-text-muted">No payments</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {recentPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs">{p.payment_method?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-text-muted">{formatDate(p.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatCurrency(p.amount)}</span>
                      <StatusChip status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold mb-4">Credit Profile</h2>
            {[
              ['Status', <StatusChip status={c.status} />],
              ['Credit Limit', formatCurrency(c.credit_limit)],
              ['Used Credit', formatCurrency(c.used_credit)],
              ['Available', formatCurrency((c.credit_limit || 0) - (c.used_credit || 0))],
              ['Credit Days', c.credit_days ? `${c.credit_days}d` : '—'],
              ['Outstanding', formatCurrencyCompact(c.outstanding_amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
                <span className="text-text-muted">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>

          <Link href={`/ae/customers/${id}/credit`} className="block w-full px-4 py-2.5 text-sm font-medium text-center bg-brand-600 text-white rounded-md hover:bg-brand-700">
              Manage Credit Terms
            </Link>
        </div>
      </div>
    </div>
  );
}
