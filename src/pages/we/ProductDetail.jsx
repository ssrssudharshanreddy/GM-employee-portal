import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { Zap, AlertTriangle, UploadCloud, X } from 'lucide-react';

const BASE_UNITS = [
  'Litre', 'mL', 'Kg', 'Gram', 'Piece', 'Pack', 'Box', 'Carton', 
  'Bottle', 'Drum', 'Can', 'Pouch / Sachet', 'Bag', 'Dozen'
];

const EMPTY_FORM = {
  name: '',
  category_id: '',
  pack_size: '',
  unit: 'Litre',
  price: '',
  gst_percent: '18',
  quantity: '',
  low_stock_alert: '',
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
  
  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch existing product
  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id && !isNew,
  });

  // Fetch categories
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const categories = catData?.data ?? [];

  useEffect(() => {
    if (data) {
      const p = data?.product || data;
      const inv = p.inventory;
      setForm({
        name: p.name || '',
        category_id: p.category_id || '',
        pack_size: p.specifications?.pack_size ?? '',
        unit: p.unit || 'Litre',
        price: p.price || '',
        gst_percent: String(p.gst_rate ?? p.gst_percent ?? 18),
        quantity: '',
        low_stock_alert: inv?.reorder_threshold ?? '',
        description: p.description || '',
        is_active: p.is_active !== false,
      });
      setExistingImages(p.images || []);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (formData) => isNew ? api.upload('/products', formData, 'POST') : api.upload(`/products/${id}`, formData, 'PATCH'),
    onSuccess: (res) => {
      qc.invalidateQueries(['products']);
      qc.invalidateQueries(['inventory']);
      const savedId = res?.id || res?.product?.id || id;
      navigate(savedId && savedId !== 'new' ? `/we/products/${savedId}` : '/we/products');
    },
    onError: (err) => setError(err.message || 'Failed to save product'),
  });

  function handleFileChange(e) {
    if (e.target.files) {
      setNewFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  }

  function removeNewFile(index) {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(imgUrl) {
    setExistingImages(prev => prev.filter(url => url !== imgUrl));
    setDeletedImages(prev => [...prev, imgUrl]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!form.category_id) { setError('Please select a category'); return; }
    if (!form.pack_size) { setError('Please enter a pack size'); return; }

    const gstVal = parseFloat(form.gst_percent);
    if (isNaN(gstVal) || gstVal < 0 || gstVal > 100) {
      setError('GST % must be a number between 0 and 100');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category_id', form.category_id);
    formData.append('pack_size', form.pack_size);
    formData.append('unit', form.unit);
    formData.append('price', form.price);
    formData.append('gst_rate', gstVal);
    formData.append('is_active', form.is_active);
    
    if (form.description) formData.append('description', form.description);
    if (form.quantity !== '') formData.append('initial_quantity', form.quantity);
    if (form.low_stock_alert !== '') formData.append('reorder_threshold', form.low_stock_alert);

    // Append new files
    newFiles.forEach(file => {
      formData.append('files', file);
    });

    // Append deleted existing images (as JSON string so backend can parse it)
    if (deletedImages.length > 0) {
      formData.append('deleted_images', JSON.stringify(deletedImages));
    }

    save.mutate(formData);
  }

  if (!isNew && isLoading) {
    return (
      <div>
        <Link href="/we/products" className="text-sm text-brand-600 hover:underline">← Products</Link>
        <div className="mt-4 animate-pulse space-y-4">
          <div className="h-64 bg-surface-100 rounded-lg" />
        </div>
      </div>
    );
  }

  const product = (!isNew && data) ? (data?.product || data) : null;
  const currentQty = product?.inventory?.quantity ?? null;
  const currentReserved = product?.inventory?.reserved_quantity ?? 0;

  return (
    <div>
      <Link href="/we/products" className="text-sm text-brand-600 hover:underline">← Products</Link>

      <PageHeader
        title={isNew ? 'New Product' : (form.name || 'Edit Product')}
        subtitle={isNew ? 'Product code will be auto-generated' : product?.product_code}
      />

      {/* Product code badge (edit mode) */}
      {!isNew && product?.product_code && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-md">
          <Zap className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-xs font-mono font-semibold text-text-secondary">{product.product_code}</span>
        </div>
      )}

      <div className="max-w-3xl bg-white rounded-lg shadow-card p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Product Name & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Liquid Detergent"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
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
            </div>
          </div>

          {/* Pack Size & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Pack Size (Amount) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.pack_size}
                onChange={e => setForm({ ...form, pack_size: e.target.value })}
                required min={0.01} step="any"
                placeholder="e.g. 5"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Base Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {BASE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Price & GST */}
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                GST %
              </label>
              <input
                type="number"
                value={form.gst_percent}
                onChange={e => setForm({ ...form, gst_percent: e.target.value })}
                min={0} max={100} step="0.01"
                placeholder="18"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Product Images</label>
            <div className="border-2 border-dashed border-surface-200 rounded-lg p-6 bg-surface-50 text-center">
              <UploadCloud className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary mb-4">Drag & drop or click to upload images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium bg-white border border-surface-200 rounded-md hover:bg-surface-50 text-brand-600 transition-colors"
              >
                Browse Files
              </button>
            </div>

            {/* Image Previews */}
            {(existingImages.length > 0 || newFiles.length > 0) && (
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                {existingImages.map((url, i) => (
                  <div key={`exist-${i}`} className="relative group rounded-md overflow-hidden border border-surface-200 aspect-square">
                    <img src={url} alt={`Product ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {newFiles.map((file, i) => (
                  <div key={`new-${i}`} className="relative group rounded-md overflow-hidden border border-surface-200 aspect-square">
                    <img src={URL.createObjectURL(file)} alt={`New upload ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 bg-brand-500 text-white text-[10px] text-center py-0.5">NEW</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantity + Low Stock Alert */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {isNew ? 'Initial Stock Quantity' : 'Add / Adjust Quantity'}
                <span className="ml-1 text-xs font-normal text-text-muted">(units)</span>
              </label>
              {!isNew && currentQty !== null && (
                <div className="mb-1.5 flex items-center gap-2 text-xs text-text-muted">
                  <span>Current stock: <span className="font-semibold text-text-primary">{currentQty - currentReserved}</span> available ({currentReserved} reserved)</span>
                </div>
              )}
              <input
                type="number"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                min={0} step={1}
                placeholder={isNew ? '0' : 'Enter quantity to add'}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Low Stock Alert
                  <span className="text-xs font-normal text-text-muted">(threshold)</span>
                </span>
              </label>
              <input
                type="number"
                value={form.low_stock_alert}
                onChange={e => setForm({ ...form, low_stock_alert: e.target.value })}
                min={0} step={1}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-text-muted mt-1">Alert when stock falls below this number</p>
            </div>
          </div>

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
