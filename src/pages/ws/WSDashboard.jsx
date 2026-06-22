import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';
import { ShoppingCart, RotateCcw, CheckCircle, Truck } from 'lucide-react';

export default function WSDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['ws-dashboard'],
    queryFn: () => api.get('/reports/ws/dashboard'),
  });

  const { data: myOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders', { my_orders: true, status: 'DISPATCHED', limit: 5 }),
  });

  const kpis = data?.kpis || {};
  const orders = myOrders?.orders || myOrders?.data || [];

  return (
    <div>
      <PageHeader title="My Delivery Dashboard" subtitle={`Welcome back, ${user?.email?.split('@')[0]}`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="Assigned Today" value={kpis.assigned_today} icon={ShoppingCart} color="brand" loading={isLoading} />
        <KPICard label="Delivered Today" value={kpis.delivered_today} icon={CheckCircle} color="green" loading={isLoading} />
        <KPICard label="In Transit" value={kpis.in_transit} icon={Truck} color="amber" loading={isLoading} />
        <KPICard label="Pending Returns" value={kpis.pending_returns} icon={RotateCcw} color="orange" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">My Active Deliveries</h2>
            <Link href="/ws/orders"><a className="text-xs text-brand-600 hover:underline">View all</a></Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No active deliveries</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order.id} href={`/ws/orders/${order.id}`}>
                  <a className="block p-4 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-medium">{order.order_number}</span>
                      <StatusChip status={order.status} />
                    </div>
                    <p className="text-sm text-text-secondary">{order.company_name}</p>
                    <p className="text-xs text-text-muted mt-1 truncate">{order.delivery_address}</p>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-5">
          <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/ws/orders">
              <a className="flex items-center gap-3 p-4 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-brand-700">My Orders</p>
                  <p className="text-xs text-brand-600">View and fulfill assigned deliveries</p>
                </div>
              </a>
            </Link>
            <Link href="/ws/returns">
              <a className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-semibold text-orange-700">Return Pickups</p>
                  <p className="text-xs text-orange-600">Collect and verify return items</p>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
