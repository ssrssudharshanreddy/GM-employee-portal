import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatNumber, formatDate } from '../../utils/format';

export default function WEInventoryDetail() {
  const [, params] = useRoute('/we/inventory/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [adjustForm, setAdjustForm] = useState({ quantity: '', reason: '', type: 'add' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: () => api.get(`/inventory/${id}`),
    enabled: !!id,
  });

  const adjust = useMutation({
    mutationFn: (d) => api.post(`/inventory/${id}/adjust`, d),
    onSuccess: () => { qc.invalidateQueries(['inventory-item', id]); setSuccess('Inventory adjusted.'); setAdjustForm({ quantity: '', reason: '', type: 'add' }); },
    onError: (err) => setError(err.message),
  });

  const item = data?.inventory || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!item) return <div className="text-center py-12 text-text-muted">Item not found</div>;

  return (
    <div>
      <Link href="/we/inventory" className="text-sm text-brand-600 hover:underline">← Inventory</Link>
      <PageHeader title={item.product_name || 'Inventory Item'} subtitle={`SKU: ${item.product_code}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Stock Levels</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['In Stock', `${formatNumber(item.quantity)} ${item.product?.specifications?.pack_size ? item.product.specifications.pack_size + ' ' : ''}${item.unit}`],
                ['Allocated', `${formatNumber(item.allocated_quantity)} ${item.product?.specifications?.pack_size ? item.product.specifications.pack_size + ' ' : ''}${item.unit}`],
                ['Available', `${formatNumber((item.quantity || 0) - (item.allocated_quantity || 0))} ${item.product?.specifications?.pack_size ? item.product.specifications.pack_size + ' ' : ''}${item.unit}`],
                ['Reorder At', `${formatNumber(item.reorder_threshold)} ${item.product?.specifications?.pack_size ? item.product.specifications.pack_size + ' ' : ''}${item.unit}`],
              ].map(([k, v]) => (
                <div key={k} className="p-4 bg-surface-50 rounded-lg text-center">
                  <p className="text-xs text-text-muted">{k}</p>
                  <p className="text-lg font-bold mt-1">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Adjust Stock */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Adjust Stock</h2>
            {success && <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
            <form onSubmit={(e) => { e.preventDefault(); adjust.mutate({ ...adjustForm, quantity: Number(adjustForm.quantity) }); }} className="flex flex-wrap gap-3">
              <select value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                className="px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="add">Add stock</option>
                <option value="remove">Remove stock</option>
                <option value="set">Set absolute</option>
              </select>
              <input type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} required min={0}
                placeholder="Quantity *"
                className="px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 w-32" />
              <input value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} required
                placeholder="Reason *"
                className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button type="submit" disabled={adjust.isPending} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md disabled:opacity-50">
                Apply
              </button>
            </form>
          </div>

          {/* Adjustment History */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Adjustment History</h2>
            {(item.adjustments || []).length === 0 ? (
              <p className="text-sm text-text-muted">No adjustments recorded</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {(item.adjustments || []).map((adj, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs">{adj.reason}</p>
                      <p className="text-xs text-text-muted">{adj.actor_name} · {formatDate(adj.created_at)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${adj.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.quantity > 0 ? '+' : ''}{formatNumber(adj.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-3">Product Details</h2>
          {[
            ['Product Code', item.product_code],
            ['Category', item.category_name || '—'],
            ['Unit', `${item.product?.specifications?.pack_size ? item.product.specifications.pack_size + ' ' : ''}${item.unit}`],
            ['Price', `₹${item.price}`],
            ['GST', item.gst_percent ? `${item.gst_percent}%` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-muted">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
