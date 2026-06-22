import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/format';

export default function WEProductDetail() {
  const [, params] = useRoute('/we/products/:id');
  const id = params?.id;
  const isNew = id === 'new';
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: '', product_code: '', unit: 'Litre', price: '', gst_percent: 18, description: '', is_active: true });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id && !isNew,
  });

  useEffect(() => {
    if (data) {
      const p = data?.product || data;
      setForm({ name: p.name || '', product_code: p.product_code || '', unit: p.unit || 'Litre', price: p.price || '', gst_percent: p.gst_percent || 18, description: p.description || '', is_active: p.is_active !== false });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (d) => isNew ? api.post('/products', d) : api.patch(`/products/${id}`, d),
    onSuccess: (res) => {
      qc.invalidateQueries(['products']);
      navigate(`/we/products/${res?.product?.id || res?.id || ''}`);
    },
    onError: (err) => setError(err.message),
  });

  if (!isNew && isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;

  return (
    <div>
      <Link href="/we/products"><a className="text-sm text-brand-600 hover:underline">← Products</a></Link>
      <PageHeader title={isNew ? 'New Product' : (form.name || 'Edit Product')} />

      <div className="max-w-2xl bg-white rounded-lg shadow-card p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); save.mutate({ ...form, price: Number(form.price), gst_percent: Number(form.gst_percent) }); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Code *</label>
              <input value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Unit *</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
                {['Litre','Kg','Piece','Box','Pack','Bottle','Drum','Can'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min={0} step="0.01"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">GST %</label>
              <select value={form.gst_percent} onChange={(e) => setForm({ ...form, gst_percent: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
                {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-brand-600" />
              <label htmlFor="is_active" className="text-sm font-medium text-text-secondary">Active</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={save.isPending} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50">
              {save.isPending ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/we/products')} className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
