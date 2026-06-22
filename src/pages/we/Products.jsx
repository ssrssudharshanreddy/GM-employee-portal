import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import { formatCurrency } from '../../utils/format';
import { Plus } from 'lucide-react';

export default function WEProducts() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category, page],
    queryFn: () => api.get('/products', { search, category_id: category || undefined, page, limit: 20 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const products = data?.products || data?.data || [];
  const total = data?.total || 0;
  const catOptions = (categories?.categories || categories?.data || []).map(c => ({ value: c.id, label: c.name }));

  const columns = [
    { key: 'product_code', label: 'Code', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'name', label: 'Product Name' },
    { key: 'category_name', label: 'Category', render: (v) => v || '—' },
    { key: 'unit', label: 'Unit' },
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
      <PageHeader
        title="Product Catalogue"
        subtitle="All products available for ordering"
        actions={
          <Link href="/we/products/new">
            <a className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700">
              <Plus className="w-4 h-4" /> Add Product
            </a>
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
