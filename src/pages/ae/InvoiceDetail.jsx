import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency } from '../../utils/format';

export default function AEInvoiceDetail() {
  const [, params] = useRoute('/ae/invoices/:id');
  const id = params?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/invoices/${id}`),
    enabled: !!id,
  });

  const inv = data?.invoice || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!inv) return <div className="text-center py-12 text-text-muted">Invoice not found</div>;

  const items = inv.items || inv.invoice_items || [];

  return (
    <div>
      <Link href="/ae/invoices" className="text-sm text-brand-600 hover:underline">← Invoices</Link>
      <PageHeader
        title={inv.invoice_number}
        subtitle={`${inv.company_name} · Due ${formatDate(inv.due_date)}`}
        actions={<StatusChip status={inv.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Line Items</h2>
            <div className="divide-y divide-surface-200">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product_name || item.description}</p>
                    <p className="text-xs text-text-muted font-mono">{item.product_code}</p>
                  </div>
                  <div className="text-sm text-right">
                    <p>×{item.quantity} @ {formatCurrency(item.unit_price)}</p>
                    <p className="font-semibold">{formatCurrency(item.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-200 mt-4 pt-4 space-y-2">
              {[
                ['Subtotal', inv.subtotal_amount],
                ['GST', inv.gst_amount],
                ['Paid', inv.paid_amount],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-text-muted">{k}</span>
                  <span>{formatCurrency(v)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base border-t border-surface-200 pt-2">
                <span>Total Due</span>
                <span>{formatCurrency((inv.total_amount || 0) - (inv.paid_amount || 0))}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Payments Applied</h2>
            {(inv.payments || []).length === 0 ? (
              <p className="text-sm text-text-muted">No payments yet</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {(inv.payments || []).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm">{p.payment_method?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-text-muted">{formatDate(p.payment_date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-4">Invoice Summary</h2>
          {[
            ['Invoice #', inv.invoice_number],
            ['Order #', inv.order_number || '—'],
            ['Status', <StatusChip status={inv.status} />],
            ['Issue Date', formatDate(inv.issue_date || inv.created_at)],
            ['Due Date', formatDate(inv.due_date)],
            ['Total', formatCurrency(inv.total_amount)],
            ['Paid', formatCurrency(inv.paid_amount)],
            ['Balance', formatCurrency((inv.total_amount || 0) - (inv.paid_amount || 0))],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-muted">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
