import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import RoleBadge from '../../components/RoleBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate, formatCurrency, formatCurrencyCompact } from '../../utils/format';
import { useState } from 'react';

export default function CEOCustomerDetail() {
  const [, params] = useRoute('/ceo/customers/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [actionModal, setActionModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`),
    enabled: !!id,
  });

  const { data: orders } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => api.get('/orders', { customer_id: id, limit: 5 }),
    enabled: !!id,
  });

  const statusAction = useMutation({
    mutationFn: ({ action, reason }) => api.patch(`/customers/${id}/status`, { action, reason }),
    onSuccess: () => {
      qc.invalidateQueries(['customer', id]);
      setActionModal(null);
    },
  });

  const customer = data?.customer || data;
  const recentOrders = orders?.orders || orders?.data || [];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Customer Detail" />
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-surface-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!customer) return <div className="text-center py-12 text-text-muted">Customer not found</div>;

  async function handleAction(action, reason) {
    setActionLoading(true);
    try {
      await statusAction.mutateAsync({ action, reason });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link href="/ceo/customers"><a className="text-sm text-brand-600 hover:underline">← Customers</a></Link>
      </div>
      <PageHeader
        title={customer.company_name}
        subtitle={customer.contact_person}
        actions={
          <div className="flex gap-2">
            {customer.status === 'ACTIVE' && (
              <button onClick={() => setActionModal('suspend')} className="px-3 py-2 text-sm font-medium bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200">
                Suspend
              </button>
            )}
            {(customer.status === 'ACTIVE' || customer.status === 'SUSPENDED') && (
              <button onClick={() => setActionModal('block')} className="px-3 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                Block
              </button>
            )}
            {(customer.status === 'SUSPENDED' || customer.status === 'BLOCKED') && (
              <button onClick={() => setActionModal('reactivate')} className="px-3 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                Reactivate
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Company Information</h2>
              <StatusChip status={customer.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ['Company Name', customer.company_name],
                ['Contact Person', customer.contact_person],
                ['Email', customer.email],
                ['Phone', customer.phone],
                ['GSTIN', customer.gstin || '—'],
                ['City', customer.city || '—'],
                ['CREM', customer.crem_name || '—'],
                ['Joined', formatDate(customer.created_at)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-text-muted">{label}</dt>
                  <dd className="text-sm font-medium text-text-primary mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Recent Orders</h2>
              <Link href="/ceo/orders"><a className="text-xs text-brand-600 hover:underline">View all</a></Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-muted">No orders yet</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {recentOrders.map(order => (
                  <Link key={order.id} href={`/ceo/orders/${order.id}`}>
                    <a className="flex items-center justify-between py-3 hover:bg-surface-50 -mx-1 px-1 rounded">
                      <div>
                        <p className="text-sm font-mono">{order.order_number}</p>
                        <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatCurrency(order.total_amount)}</span>
                        <StatusChip status={order.status} />
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Credit Profile */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Credit Profile</h2>
            {[
              ['Credit Limit', formatCurrency(customer.credit_limit)],
              ['Used Credit', formatCurrency(customer.used_credit)],
              ['Available', formatCurrency((customer.credit_limit || 0) - (customer.used_credit || 0))],
              ['Credit Days', customer.credit_days ? `${customer.credit_days} days` : '—'],
              ['Outstanding', formatCurrencyCompact(customer.outstanding_amount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-surface-100 last:border-0">
                <span className="text-xs text-text-muted">{label}</span>
                <span className="text-xs font-semibold text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Modals */}
      {actionModal === 'suspend' && (
        <ConfirmModal
          open title="Suspend Customer"
          consequenceText={`This will suspend ${customer.company_name}. They cannot place new orders while suspended.`}
          confirmLabel="Yes, Suspend"
          confirmVariant="danger"
          loading={actionLoading}
          onClose={() => setActionModal(null)}
          onConfirm={() => handleAction('suspend')}
        />
      )}
      {actionModal === 'block' && (
        <ConfirmModal
          open title="Block Customer"
          consequenceText={`This will permanently block ${customer.company_name}. They will see a blocked banner on their portal.`}
          confirmLabel="Yes, Block"
          confirmVariant="danger"
          loading={actionLoading}
          onClose={() => setActionModal(null)}
          onConfirm={() => handleAction('block')}
        />
      )}
      {actionModal === 'reactivate' && (
        <ConfirmModal
          open title="Reactivate Customer"
          consequenceText={`This will reactivate ${customer.company_name} and allow them to place orders again.`}
          confirmLabel="Yes, Reactivate"
          confirmVariant="primary"
          loading={actionLoading}
          onClose={() => setActionModal(null)}
          onConfirm={() => handleAction('reactivate')}
        />
      )}
    </div>
  );
}
