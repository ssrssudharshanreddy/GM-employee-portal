import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import { formatPercent } from '../../utils/format';
import { Users, MapPin, Phone, MessageSquare } from 'lucide-react';

export default function CREMReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['crem-reports'],
    queryFn: () => api.get('/reports/crem/summary'),
  });

  const r = data?.report || data || {};

  return (
    <div>
      <PageHeader title="CREM Reports" subtitle="Your activity and performance summary" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Customers Managed" value={r.customers_managed} icon={Users} color="brand" loading={isLoading} />
        <KPICard label="Visits This Month" value={r.visits_this_month} icon={MapPin} color="green" loading={isLoading} />
        <KPICard label="Follow-Ups Done" value={r.follow_ups_done} icon={Phone} color="orange" loading={isLoading} />
        <KPICard label="Tickets Resolved" value={r.tickets_resolved} icon={MessageSquare} color="purple" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Visit Summary</h2>
          {(r.visit_by_type || []).map((v) => (
            <div key={v.type} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-secondary">{v.type?.replace(/_/g,' ')}</span>
              <span className="font-semibold">{v.count}</span>
            </div>
          ))}
          {!r.visit_by_type && !isLoading && <p className="text-sm text-text-muted text-center py-4">No visit data</p>}
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold mb-4">Lead Conversion</h2>
          {(r.lead_funnel || []).map((stage) => (
            <div key={stage.stage} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-secondary">{stage.stage?.replace(/_/g,' ')}</span>
              <span className="font-semibold">{stage.count}</span>
            </div>
          ))}
          {!r.lead_funnel && !isLoading && <p className="text-sm text-text-muted text-center py-4">No lead data</p>}
        </div>
      </div>
    </div>
  );
}
