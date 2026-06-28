import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import { formatCurrency } from '../../utils/format';
import { Plus, CheckCircle2 } from 'lucide-react';

export default function WEProducts() {
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [savedMsg, setSavedMsg] = useState('');

  // Show success banner if navigated back after save
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('saved') === '1') {
      setSavedMsg('Product saved successfully!');
      // Clear the ?saved=1 param without re-rendering
      window.history.replaceState({}, '', window.location.pathname);
      const t = setTimeout(() => setSavedMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [location]);


  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category, page],
    queryFn: () => api.get('/products', { search, category_id: category || undefined, page, limit: 20 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const catOptions = (categories?.data ?? []).map(c => ({ value: c.id, label: c.name }));

  const columns = [
    { 
      key: 'image', 
      label: '', 
      render: (_, row) => (
        <div className="w-10 h-10 rounded overflow-hidden bg-surface-100 flex items-center justify-center border border-surface-200">
          {row.images?.[0] ? (
            <img src={row.images[0]} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-text-muted">No Img</span>
          )}
        </div>
      )
    },
    { key: 'product_code', label: 'Code', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'name', label: 'Product Name' },
    { key: 'category_name', label: 'Category', render: (v) => v || '—' },
    { 
      key: 'unit', 
      label: 'Size', 
      render: (_, row) => (
        <span>
          {row.specifications?.pack_size ? `${row.specifications.pack_size} ` : ''}
          {row.unit}
        </span>
      )
    },
    { key: 'price', label: 'Price', render: (v) => formatCurrency(v) },
    { key: 'gst_percent', label: 'GST %', render: (v) => v ? `${v}%` : '—' },
    { key: 'is_active', label: 'Active', render: (v) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
        {v ? 'Active' : 'Inactive'}
      </span>
    )},
  ];

  return (
    <div>
      {savedMsg && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          {savedMsg}
        </div>
      )}
      <PageHeader
        title="Product Catalogue"
        subtitle="All products available for ordering"
        actions={
          <Link href="/we/products/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
        }
      />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={catOptions.length > 0 ? [{ type: 'select', value: category, onChange: (v) => { setCategory(v); setPage(1); }, placeholder: 'All Categories', options: catOptions }] : []}
      />
      <DataTable
        columns={columns}
        data={products}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/we/products/${row.id}`)}
        emptyMessage="No products found"
      />
    </div>
  );
}
