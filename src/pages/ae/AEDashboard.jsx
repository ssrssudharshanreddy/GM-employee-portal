import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrencyCompact } from '../../utils/format';
import { DollarSign, CreditCard, TrendingUp, AlertTriangle, ClipboardList, FileText } from 'lucide-react';

export default function AEDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['ae-dashboard'],
    queryFn: () => api.get('/reports/ae/dashboard'),
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: () => api.get('/payments', { status: 'PENDING_VERIFICATION', limit: 5 }),
  });

  const kpis = data?.kpis || {};
  const payments = pendingPayments?.payments || pendingPayments?.data || [];

  return (
    <div>
      <PageHeader title="Accounts Executive Dashboard" subtitle="Payments, credit management, and collections" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <KPICard label="Pending Verifications" value={kpis.pending_verifications} icon={CreditCard} color="amber" loading={isLoading} />
        <KPICard label="Total Outstanding" value={formatCurrencyCompact(kpis.total_outstanding)} icon={TrendingUp} color="red" loading={isLoading} />
        <KPICard label="Overdue Invoices" value={kpis.overdue_invoices} icon={AlertTriangle} color="red" loading={isLoading} />
        <KPICard label="Pending Applications" value={kpis.pending_applications} icon={ClipboardList} color="purple" loading={isLoading} />
        <KPICard label="Collected MTD" value={formatCurrencyCompact(kpis.collected_mtd)} icon={DollarSign} color="green" loading={isLoading} />
        <KPICard label="Open Collection Tasks" value={kpis.open_collection_tasks} icon={FileText} color="orange" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payment Verifications */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Pending Verifications</h2>
            <Link href="/ae/payments" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No pending verifications</p>
          ) : (
            <div className="divide-y divide-surface-200">
              {payments.map((p) => (
                <Link key={p.id} href={`/ae/payments/${p.id}`} className="flex items-center justify-between py-3 hover:bg-surface-50 -mx-1 px-1 rounded">
                    <div>
                      <p className="text-sm font-medium">{p.company_name}</p>
                      <p className="text-xs text-text-muted">{p.payment_method?.replace(/_/g,' ')} · {formatDate(p.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrencyCompact(p.amount)}</p>
                      <StatusChip status={p.status} />
                    </div>
                  </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <h2 className="text-base font-semibold mb-4">Quick Access</h2>
          <div className="space-y-2">
            {[
              { href: '/ae/payments', label: 'Verify Payments', icon: CreditCard, desc: 'Review payment submissions' },
              { href: '/ae/applications', label: 'Application Review', icon: ClipboardList, desc: 'Credit setup for new customers' },
              { href: '/ae/outstanding', label: 'Outstanding Report', icon: TrendingUp, desc: 'Overdue invoices and amounts' },
              { href: '/ae/collections', label: 'Collection Tasks', icon: DollarSign, desc: 'Follow-up on overdue accounts' },
              { href: '/ae/invoices', label: 'Invoice Management', icon: FileText, desc: 'All invoices by status' },
            ].map(({ href, label, icon: Icon, desc }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 hover:bg-surface-50 rounded-lg transition-colors">
                  <Icon className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <p className="text-xs text-text-muted">{desc}</p>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
