import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatNumber } from '../../utils/format';
import RoleBadge from '../../components/RoleBadge';

export default function WEStaffDetail() {
  const [, params] = useRoute('/we/staff/:id');
  const id = params?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.get(`/employees/${id}`),
    enabled: !!id,
  });

  const { data: orders } = useQuery({
    queryKey: ['ws-orders', id],
    queryFn: () => api.get('/orders', { ws_id: id, limit: 5 }),
    enabled: !!id,
  });

  const emp = data?.employee || data;
  const recentOrders = orders?.orders || orders?.data || [];

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;

  return (
    <div>
      <Link href="/we/staff" className="text-sm text-brand-600 hover:underline">← WS Staff</Link>
      <PageHeader title={emp?.full_name || 'Staff Member'} subtitle={emp?.email} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-card p-6 mb-6">
            <h2 className="text-base font-semibold mb-4">Staff Info</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Name', emp?.full_name],
                ['Email', emp?.email],
                ['Phone', emp?.phone || '—'],
                ['Status', <StatusChip status={emp?.status} />],
                ['Role', <RoleBadge role={emp?.role} />],
                ['Joined', formatDate(emp?.created_at)],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-text-muted">{k}</dt><dd className="font-medium mt-0.5">{v}</dd></div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Recent Assignments</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-muted">No assignments yet</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs font-mono">{order.order_number}</p>
                      <p className="text-xs text-text-muted">{order.company_name}</p>
                    </div>
                    <StatusChip status={order.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-3">Performance</h2>
          {[
            ["Today's Deliveries", formatNumber(emp?.deliveries_today)],
            ['Total Deliveries', formatNumber(emp?.deliveries_total)],
            ['Pending Orders', formatNumber(emp?.pending_orders)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-muted">{k}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
