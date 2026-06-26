import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatNumber, formatCurrencyCompact } from '../../utils/format';
import { Package, ShoppingCart, Truck, RotateCcw, Archive, AlertTriangle, UserCheck } from 'lucide-react';

export default function WEDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['we-dashboard'],
    queryFn: () => api.get('/reports/we/dashboard'),
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: () => api.get('/orders', { status: 'CONFIRMED', limit: 5 }),
  });

  const kpis = data?.kpis || {};
  const orders = pendingOrders?.orders || pendingOrders?.data || [];

  return (
    <div>
      <PageHeader title="Warehouse Executive Dashboard" subtitle="Inventory, fulfillment, and team oversight" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard label="Orders to Process" value={kpis.orders_to_process} icon={ShoppingCart} color="amber" loading={isLoading} />
        <KPICard label="Low Stock Items" value={kpis.low_stock_items} icon={AlertTriangle} color="red" loading={isLoading} />
        <KPICard label="Dispatched Today" value={kpis.dispatched_today} icon={Truck} color="green" loading={isLoading} />
        <KPICard label="Pending Returns" value={kpis.pending_returns} icon={RotateCcw} color="orange" loading={isLoading} />
        <KPICard label="Total SKUs" value={kpis.total_skus} icon={Package} color="brand" loading={isLoading} />
        <KPICard label="Inventory Value" value={formatCurrencyCompact(kpis.inventory_value)} icon={Archive} color="purple" loading={isLoading} />
        <KPICard label="WS Staff Active" value={kpis.ws_staff_active} icon={UserCheck} color="cyan" loading={isLoading} />
        <KPICard label="Orders Today" value={kpis.orders_today} icon={ShoppingCart} color="brand" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Queue */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Orders Awaiting Processing</h2>
            <Link href="/we/orders" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No orders awaiting processing</p>
          ) : (
            <div className="divide-y divide-surface-200">
              {orders.map((order) => (
                <Link key={order.id} href={`/we/orders/${order.id}`} className="flex items-center justify-between py-3 hover:bg-surface-50 -mx-1 px-1 rounded">
                    <div>
                      <p className="text-sm font-mono font-medium">{order.order_number}</p>
                      <p className="text-xs text-text-muted">{order.company_name} · {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{order.item_count} items</span>
                      <StatusChip status={order.status} />
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
              { href: '/we/inventory', icon: Archive, label: 'Inventory Management' },
              { href: '/we/products', icon: Package, label: 'Product Catalogue' },
              { href: '/we/orders', icon: ShoppingCart, label: 'Order Queue' },
              { href: '/we/deliveries', icon: Truck, label: 'Deliveries' },
              { href: '/we/returns', icon: RotateCcw, label: 'Return Reviews' },
              { href: '/we/staff', icon: UserCheck, label: 'WS Staff' },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 hover:bg-surface-50 rounded-lg text-sm font-medium text-text-secondary transition-colors">
                  <Icon className="w-4 h-4 text-brand-600" />
                  {label}
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
