import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { Zap } from 'lucide-react';

const UNITS = [
  'Litre', '500 ml', '200 ml', '100 ml',
  'Kg', '500 g', '250 g',
  'Piece', 'Pack', 'Box', 'Carton',
  'Bottle', 'Drum', 'Can', 'Pouch',
  'Dozen', 'Tonne',
];

const GST_RATES = [0, 5, 12, 18, 28];

const EMPTY_FORM = {
  name: '',
  category_id: '',
  unit: 'Litre',
  price: '',
  gst_percent: 18,
  initial_quantity: '',
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
        category_id: p.category_id || '',
        unit: p.unit || 'Litre',
        price: p.price || '',
        gst_percent: p.gst_rate ?? p.gst_percent ?? 18,
        initial_quantity: '',   // only relevant on create
        description: p.description || '',
        is_active: p.is_active !== false,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (d) => isNew ? api.post('/products', d) : api.patch(`/products/${id}`, d),
    onSuccess: (res) => {
      qc.invalidateQueries(['products']);
      qc.invalidateQueries(['inventory']);
      const savedId = res?.id || res?.product?.id || id;
      navigate(savedId && savedId !== 'new' ? `/we/products/${savedId}` : '/we/products');
    },
    onError: (err) => setError(err.message || 'Failed to save product'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.category_id) { setError('Please select a category'); return; }

    const payload = {
      name: form.name,
      category_id: form.category_id,
      unit: form.unit,
      price: Number(form.price),
      gst_rate: Number(form.gst_percent),
      description: form.description || null,
      is_active: form.is_active,
    };

    // Only send initial_quantity on create
    if (isNew && form.initial_quantity !== '') {
      payload.initial_quantity = Number(form.initial_quantity);
    }

    save.mutate(payload);
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

  const product = (!isNew && data) ? (data?.product || data) : null;

  return (
    <div>
      <Link href="/we/products" className="text-sm text-brand-600 hover:underline">← Products</Link>
      <PageHeader
        title={isNew ? 'New Product' : (form.name || 'Edit Product')}
        subtitle={isNew ? 'Product code will be auto-generated' : product?.product_code}
      />

      {/* Auto-generated code badge (edit mode) */}
      {!isNew && product?.product_code && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-md">
          <Zap className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-xs font-mono font-medium text-text-secondary">{product.product_code}</span>
        </div>
      )}

      <div className="max-w-2xl bg-white rounded-lg shadow-card p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Laundry Liquid Detergent"
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category_id}
              onChange={e => setForm({ ...form, category_id: e.target.value })}
              required
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">— Select a category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No categories yet. <Link href="/we/categories" className="underline">Create one first →</Link>
              </p>
            )}
          </div>

          {/* Unit + Price + GST */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                required min={0} step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">GST %</label>
              <select
                value={form.gst_percent}
                onChange={e => setForm({ ...form, gst_percent: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {GST_RATES.map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
          </div>

          {/* Initial Quantity — create only */}
          {isNew && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Initial Stock Quantity
                <span className="ml-1 text-xs font-normal text-text-muted">(optional — can be set later in Inventory)</span>
              </label>
              <input
                type="number"
                value={form.initial_quantity}
                onChange={e => setForm({ ...form, initial_quantity: e.target.value })}
                min={0} step={1}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Short description of the product..."
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-brand-600"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-text-secondary">
              Active <span className="font-normal text-text-muted">(visible for ordering)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-surface-100">
            <button
              type="submit"
              disabled={save.isPending}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {save.isPending ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/we/products')}
              className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md hover:bg-surface-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
