import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';
import { ClipboardList, Users, UserCheck, AlertTriangle, MessageSquare, BarChart2 } from 'lucide-react';

export default function CREDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['cre-dashboard'],
    queryFn: () => api.get('/reports/cre/dashboard'),
  });

  const { data: pendingApps } = useQuery({
    queryKey: ['pending-applications'],
    queryFn: () => api.get('/applications', { status: 'PENDING_CRE_REVIEW', limit: 5 }),
  });

  const kpis = data?.kpis || {};
  const apps = pendingApps?.applications || pendingApps?.data || [];

  return (
    <div>
      <PageHeader title="CRE Dashboard" subtitle="Application reviews, portfolio health, and team management" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <KPICard label="Pending Applications" value={kpis.pending_applications} icon={ClipboardList} color="amber" loading={isLoading} />
        <KPICard label="Action Required" value={kpis.action_required} icon={AlertTriangle} color="red" loading={isLoading} />
        <KPICard label="Portfolio Size" value={kpis.portfolio_size} icon={Users} color="brand" loading={isLoading} />
        <KPICard label="At-Risk Customers" value={kpis.at_risk_customers} icon={AlertTriangle} color="orange" loading={isLoading} />
        <KPICard label="Open Escalations" value={kpis.open_escalations} icon={MessageSquare} color="purple" loading={isLoading} />
        <KPICard label="CREMs in Team" value={kpis.team_size} icon={UserCheck} color="cyan" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Pending Applications</h2>
            <Link href="/cre/applications" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {apps.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No pending applications</p>
          ) : (
            <div className="divide-y divide-surface-200">
              {apps.map((app) => (
                <Link key={app.id} href={`/cre/applications/${app.id}`} className="flex items-center justify-between py-3 hover:bg-surface-50 -mx-1 px-1 rounded">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{app.company_name}</p>
                      <p className="text-xs text-text-muted">{formatDate(app.created_at)}</p>
                    </div>
                    <StatusChip status={app.status} />
                  </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Quick Access</h2>
          <div className="space-y-2">
            {[
              { href: '/cre/applications', label: 'Application Queue', icon: ClipboardList, desc: 'Review pending applications' },
              { href: '/cre/customers', label: 'Customer Portfolio', icon: Users, desc: 'View all customers' },
              { href: '/cre/team', label: 'My Team', icon: UserCheck, desc: 'Manage CREMs' },
              { href: '/cre/escalations', label: 'Escalations', icon: AlertTriangle, desc: 'Handle escalated tickets' },
              { href: '/cre/reports', label: 'Reports', icon: BarChart2, desc: 'Application and performance stats' },
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
