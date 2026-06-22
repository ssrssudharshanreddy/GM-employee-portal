import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import StatusChip from '../../components/StatusChip';
import { formatCurrencyCompact, formatDate } from '../../utils/format';
import {
  Users, DollarSign, ShoppingCart, TrendingUp, UserCheck,
  AlertTriangle, Package, RotateCcw, ArrowRight
} from 'lucide-react';

function QuickLink({ href, label, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-brand-50 text-brand-600 hover:bg-brand-100',
    green: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  };
  return (
    <Link href={href}>
      <a className={`flex items-center gap-3 p-4 rounded-lg font-medium text-sm transition-colors ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-5 h-5" />
        {label}
        <ArrowRight className="w-4 h-4 ml-auto" />
      </a>
    </Link>
  );
}

export default function CEODashboard() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['ceo-dashboard'],
    queryFn: () => api.get('/reports/ceo/dashboard'),
  });

  const { data: alerts } = useQuery({
    queryKey: ['ceo-alerts-summary'],
    queryFn: () => api.get('/reports/alerts', { limit: 5 }),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['ceo-recent-orders'],
    queryFn: () => api.get('/orders', { limit: 5, sort: 'created_at:desc' }),
  });

  const kpis = report?.kpis || report || {};
  const alertItems = alerts?.alerts || alerts?.data || [];
  const orders = recentOrders?.orders || recentOrders?.data || [];

  return (
    <div>
      <PageHeader
        title="CEO Command Center"
        subtitle="Complete business overview and command access"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Revenue MTD"
          value={formatCurrencyCompact(kpis.revenue_mtd)}
          delta={kpis.revenue_delta}
          deltaLabel="vs last month"
          icon={DollarSign}
          color="green"
          loading={isLoading}
        />
        <KPICard
          label="Total Outstanding"
          value={formatCurrencyCompact(kpis.total_outstanding)}
          delta={kpis.outstanding_delta}
          icon={TrendingUp}
          color="amber"
          loading={isLoading}
        />
        <KPICard
          label="Active Customers"
          value={kpis.active_customers}
          delta={kpis.customers_delta}
          deltaLabel="new this month"
          icon={Users}
          color="brand"
          loading={isLoading}
        />
        <KPICard
          label="Open Orders"
          value={kpis.open_orders}
          icon={ShoppingCart}
          color="purple"
          loading={isLoading}
        />
        <KPICard
          label="Total Employees"
          value={kpis.total_employees}
          icon={UserCheck}
          color="cyan"
          loading={isLoading}
        />
        <KPICard
          label="Overdue Amount"
          value={formatCurrencyCompact(kpis.overdue_amount)}
          icon={AlertTriangle}
          color="red"
          loading={isLoading}
        />
        <KPICard
          label="Pending Returns"
          value={kpis.pending_returns}
          icon={RotateCcw}
          color="orange"
          loading={isLoading}
        />
        <KPICard
          label="Low Stock Items"
          value={kpis.low_stock_count}
          icon={Package}
          color="amber"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4">Command Centers</h2>
          <div className="space-y-2">
            <QuickLink href="/ceo/customers" label="Customer Command Center" icon={Users} color="blue" />
            <QuickLink href="/ceo/financials" label="Financial Command Center" icon={DollarSign} color="green" />
            <QuickLink href="/ceo/warehouse" label="Warehouse Command Center" icon={Package} color="orange" />
            <QuickLink href="/ceo/employees" label="Employee Management" icon={UserCheck} color="purple" />
            <QuickLink href="/ceo/alerts" label="Alerts & Risk Center" icon={AlertTriangle} color="red" />
            <QuickLink href="/ceo/reports" label="Reports & Analytics" icon={TrendingUp} color="amber" />
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Active Alerts</h2>
            <Link href="/ceo/alerts">
              <a className="text-xs text-brand-600 hover:underline">View all</a>
            </Link>
          </div>
          <div className="space-y-3">
            {alertItems.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No active alerts</p>
            )}
            {alertItems.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-red-700">{alert.type || alert.alert_type}</p>
                  <p className="text-xs text-red-600 mt-0.5 line-clamp-2">{alert.message || alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Recent Orders</h2>
            <Link href="/ceo/orders">
              <a className="text-xs text-brand-600 hover:underline">View all</a>
            </Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No recent orders</p>
            )}
            {orders.map((order) => (
              <Link key={order.id} href={`/ceo/orders/${order.id}`}>
                <a className="flex items-center justify-between p-3 hover:bg-surface-50 rounded-lg -mx-1">
                  <div>
                    <p className="text-sm font-mono font-medium text-text-primary">{order.order_number}</p>
                    <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                  </div>
                  <StatusChip status={order.status} />
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
