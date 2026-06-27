import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';

const UNITS = ['Litre', 'Kg', 'Piece', 'Box', 'Pack', 'Bottle', 'Drum', 'Can', 'Tonne', 'Meter'];
const GST_RATES = [0, 5, 12, 18, 28];

const EMPTY_FORM = {
  name: '',
  product_code: '',
  category_id: '',
  unit: 'Litre',
  price: '',
  gst_percent: 18,
  hsn_code: '',
  min_order_qty: 1,
  description: '',
  is_active: true,
};

export default function WEProductDetail() {
  const [, params] = useRoute('/we/products/:id');
  const id = params?.id;
  const isNew = id === 'new';
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  // Fetch existing product (edit mode)
  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id && !isNew,
  });

  // Fetch categories for dropdown
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const categories = catData?.data ?? [];

  useEffect(() => {
    if (data) {
      const p = data?.product || data;
      setForm({
        name: p.name || '',
        product_code: p.product_code || '',
        category_id: p.category_id || '',
        unit: p.unit || 'Litre',
        price: p.price || '',
        gst_percent: p.gst_rate ?? p.gst_percent ?? 18,
        hsn_code: p.hsn_code || '',
        min_order_qty: p.min_order_qty || 1,
        description: p.description || '',
        is_active: p.is_active !== false,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (d) => isNew ? api.post('/products', d) : api.patch(`/products/${id}`, d),
    onSuccess: (res) => {
      qc.invalidateQueries(['products']);
      const savedId = res?.id || res?.product?.id || id;
      navigate(savedId && savedId !== 'new' ? `/we/products/${savedId}` : '/we/products');
    },
    onError: (err) => setError(err.message || 'Failed to save product'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.category_id) { setError('Please select a category'); return; }
    save.mutate({
      ...form,
      price: Number(form.price),
      gst_rate: Number(form.gst_percent),
      min_order_qty: Number(form.min_order_qty),
      hsn_code: form.hsn_code || null,
      description: form.description || null,
    });
  }

  if (!isNew && isLoading) {
    return (
      <div>
        <Link href="/we/products" className="text-sm text-brand-600 hover:underline">← Products</Link>
        <div className="mt-4 animate-pulse space-y-4">
          <div className="h-48 bg-surface-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/we/products" className="text-sm text-brand-600 hover:underline">← Products</Link>
      <PageHeader title={isNew ? 'New Product' : (form.name || 'Edit Product')} subtitle={isNew ? 'Add a product to the catalogue' : form.product_code} />

      <div className="max-w-2xl bg-white rounded-lg shadow-card p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Code <span className="text-red-500">*</span></label>
              <input value={form.product_code} onChange={e => setForm({ ...form, product_code: e.target.value })} required
                disabled={!isNew}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-surface-50 disabled:text-text-muted" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Category <span className="text-red-500">*</span></label>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
              <option value="">— Select a category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No categories yet. <Link href="/we/categories" className="underline">Create one first →</Link></p>
            )}
          </div>

          {/* Row 2: Unit + Price + GST */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Unit <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min={0} step="0.01"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">GST %</label>
              <select value={form.gst_percent} onChange={e => setForm({ ...form, gst_percent: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {GST_RATES.map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: HSN + Min Order Qty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">HSN Code</label>
              <input value={form.hsn_code} onChange={e => setForm({ ...form, hsn_code: e.target.value })} placeholder="e.g. 27101990"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Min Order Qty</label>
              <input type="number" value={form.min_order_qty} onChange={e => setForm({ ...form, min_order_qty: e.target.value })} min={1} step={1}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-brand-600" />
            <label htmlFor="is_active" className="text-sm font-medium text-text-secondary">Active (visible for ordering)</label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-surface-100">
            <button type="submit" disabled={save.isPending}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {save.isPending ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/we/products')}
              className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md hover:bg-surface-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
