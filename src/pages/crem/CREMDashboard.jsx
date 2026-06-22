import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatRelative } from '../../utils/format';
import { Users, Star, MapPin, Phone, MessageSquare, ClipboardList, AlertTriangle } from 'lucide-react';

export default function CREMDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['crem-dashboard'],
    queryFn: () => api.get('/reports/crem/dashboard'),
  });

  const { data: todayVisits } = useQuery({
    queryKey: ['today-visits'],
    queryFn: () => api.get('/visits', { date: new Date().toISOString().slice(0, 10), limit: 5 }),
  });

  const { data: pendingFollowUps } = useQuery({
    queryKey: ['pending-follow-ups'],
    queryFn: () => api.get('/follow-ups', { status: 'pending', limit: 5 }),
  });

  const kpis = data?.kpis || {};
  const visits = todayVisits?.visits || todayVisits?.data || [];
  const followUps = pendingFollowUps?.follow_ups || pendingFollowUps?.data || [];

  return (
    <div>
      <PageHeader title="CREM Dashboard" subtitle="Your customer portfolio, visits, and follow-ups" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <KPICard label="My Customers" value={kpis.my_customers} icon={Users} color="brand" loading={isLoading} />
        <KPICard label="Active Leads" value={kpis.active_leads} icon={Star} color="amber" loading={isLoading} />
        <KPICard label="Visits Today" value={kpis.visits_today} icon={MapPin} color="green" loading={isLoading} />
        <KPICard label="Pending Follow-Ups" value={kpis.pending_follow_ups} icon={Phone} color="orange" loading={isLoading} />
        <KPICard label="Open Tickets" value={kpis.open_tickets} icon={MessageSquare} color="purple" loading={isLoading} />
        <KPICard label="Overdue Tasks" value={kpis.overdue_tasks} icon={AlertTriangle} color="red" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Visits */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Today's Visits</h2>
            <Link href="/crem/visits"><a className="text-xs text-brand-600 hover:underline">View all</a></Link>
          </div>
          {visits.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No visits scheduled today</p>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v.id} className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{v.company_name}</p>
                    <p className="text-xs text-text-muted">{v.visit_type?.replace(/_/g, ' ')} · {v.scheduled_time}</p>
                  </div>
                  <StatusChip status={v.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Follow-Ups */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Pending Follow-Ups</h2>
            <Link href="/crem/follow-ups"><a className="text-xs text-brand-600 hover:underline">View all</a></Link>
          </div>
          {followUps.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No pending follow-ups</p>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => (
                <div key={f.id} className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
                  <Phone className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{f.company_name || f.lead_name}</p>
                    <p className="text-xs text-text-muted">{formatRelative(f.due_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/crem/visits', icon: MapPin, label: 'Log a Visit' },
              { href: '/crem/follow-ups', icon: Phone, label: 'Log Follow-Up' },
              { href: '/crem/leads', icon: Star, label: 'Manage Leads' },
              { href: '/crem/tickets', icon: MessageSquare, label: 'Open Tickets' },
              { href: '/crem/tasks', icon: ClipboardList, label: 'My Tasks' },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <a className="flex items-center gap-3 p-3 hover:bg-surface-50 rounded-lg text-sm font-medium text-text-secondary transition-colors">
                  <Icon className="w-4 h-4 text-brand-600" />
                  {label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
