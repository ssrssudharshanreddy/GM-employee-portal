import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import { formatPercent } from '../../utils/format';
import { ClipboardList, Users, UserCheck, TrendingUp } from 'lucide-react';

export default function CREReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['cre-reports'],
    queryFn: () => api.get('/reports/cre/summary'),
  });

  const r = data?.report || data || {};

  return (
    <div>
      <PageHeader title="CRE Reports" subtitle="Application funnel, portfolio health, and team performance" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Applications This Month" value={r.applications_this_month} icon={ClipboardList} color="brand" loading={isLoading} />
        <KPICard label="Approval Rate" value={formatPercent(r.approval_rate)} icon={TrendingUp} color="green" loading={isLoading} />
        <KPICard label="Avg Onboarding Days" value={r.avg_onboarding_days ? `${r.avg_onboarding_days}d` : '—'} icon={ClipboardList} color="amber" loading={isLoading} />
        <KPICard label="CREM SLA Compliance" value={formatPercent(r.team_sla_compliance)} icon={UserCheck} color="cyan" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Application Funnel</h2>
          {(r.funnel || []).map((stage) => (
            <div key={stage.stage} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
              <span className="text-sm text-text-secondary">{stage.stage?.replace(/_/g,' ')}</span>
              <span className="text-sm font-semibold">{stage.count}</span>
            </div>
          ))}
          {!r.funnel && !isLoading && <p className="text-sm text-text-muted text-center py-6">No funnel data</p>}
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Team Performance</h2>
          {(r.team_performance || []).map((member) => (
            <div key={member.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
              <div>
                <p className="text-sm font-medium">{member.full_name}</p>
                <p className="text-xs text-text-muted">{member.customer_count} customers</p>
              </div>
              <span className="text-sm font-semibold text-brand-600">{formatPercent(member.sla_compliance)} SLA</span>
            </div>
          ))}
          {!r.team_performance && !isLoading && <p className="text-sm text-text-muted text-center py-6">No team data</p>}
        </div>
      </div>
    </div>
  );
}
