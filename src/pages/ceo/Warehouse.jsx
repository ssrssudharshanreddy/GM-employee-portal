import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import { formatCurrencyCompact, formatNumber } from '../../utils/format';
import { Package, ShoppingCart, Truck, RotateCcw, AlertTriangle, Archive } from 'lucide-react';
import { Link } from 'wouter';
import StatusChip from '../../components/StatusChip';

export default function CEOWarehouse() {
  const { data, isLoading } = useQuery({
    queryKey: ['ceo-warehouse'],
    queryFn: () => api.get('/reports/ceo/warehouse'),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get('/inventory', { low_stock: true, limit: 5 }),
  });

  const kpis = data?.kpis || {};
  const products = lowStock?.inventory || lowStock?.data || [];

  return (
    <div>
      <PageHeader title="Warehouse Command Center" subtitle="Inventory, fulfillment, and returns overview" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <KPICard label="Inventory Value" value={formatCurrencyCompact(kpis.inventory_value)} icon={Archive} color="brand" loading={isLoading} />
        <KPICard label="Low Stock Items" value={kpis.low_stock_count} icon={AlertTriangle} color="red" loading={isLoading} />
        <KPICard label="Pending Allocation" value={kpis.pending_allocation} icon={Package} color="amber" loading={isLoading} />
        <KPICard label="Orders In-Flight" value={kpis.orders_in_flight} icon={ShoppingCart} color="purple" loading={isLoading} />
        <KPICard label="Dispatched Today" value={kpis.dispatched_today} icon={Truck} color="cyan" loading={isLoading} />
        <KPICard label="Pending Returns" value={kpis.pending_returns} icon={RotateCcw} color="orange" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Low Stock Alert</h2>
            <Link href="/we/inventory" className="text-xs text-brand-600 hover:underline">Manage Inventory</Link>
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No low stock items</p>
          ) : (
            <div className="divide-y divide-surface-200">
              {products.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.product_name || item.name}</p>
                    <p className="text-xs font-mono text-text-muted">
                      {item.product_code || item.code}
                      {item.category_name && <span className="ml-2 font-sans">• {item.category_name}</span>}
                      {item.gst_percent ? <span className="ml-2 font-sans">• GST: {item.gst_percent}%</span> : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-red-600">{formatNumber(item.quantity)} units</p>
                    <p className="text-xs text-text-muted">Reorder: {formatNumber(item.reorder_threshold)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/we/products', label: 'Products', icon: Package },
              { href: '/we/inventory', label: 'Inventory', icon: Archive },
              { href: '/we/orders', label: 'Orders', icon: ShoppingCart },
              { href: '/we/returns', label: 'Returns', icon: RotateCcw },
              { href: '/we/deliveries', label: 'Deliveries', icon: Truck },
              { href: '/we/staff', label: 'WS Staff', icon: Package },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-2 p-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-sm font-medium text-text-secondary transition-colors">
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
