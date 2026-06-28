import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import { formatNumber } from '../../utils/format';

export default function WEInventory() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search, lowStock, page],
    queryFn: () => api.get('/inventory', { search, low_stock: lowStock ? true : undefined, page, limit: 20 }),
  });

  const items = data?.inventory || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'product_code', label: 'Code', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'product_name', label: 'Product' },
    { key: 'category_name', label: 'Category', render: (v) => v || '—' },
    { key: 'gst_percent', label: 'GST %', render: (v) => v ? `${v}%` : '—' },
    { key: 'quantity', label: 'In Stock', render: (v, row) => (
      <span className={v <= (row.reorder_threshold || 0) ? 'font-bold text-red-600' : 'font-medium'}>
        {formatNumber(v)} {row.product?.specifications?.pack_size ? row.product.specifications.pack_size + ' ' : ''}{row.unit}
      </span>
    )},
    { key: 'reorder_threshold', label: 'Reorder At', render: (v, row) => `${formatNumber(v)} ${row.product?.specifications?.pack_size ? row.product.specifications.pack_size + ' ' : ''}${row.unit}` },
    { key: 'allocated_quantity', label: 'Allocated', render: (v, row) => `${formatNumber(v)} ${row.product?.specifications?.pack_size ? row.product.specifications.pack_size + ' ' : ''}${row.unit}` },
    { key: 'available_quantity', label: 'Available', render: (v, row) => `${formatNumber(v || (row.quantity - (row.allocated_quantity || 0)))} ${row.product?.specifications?.pack_size ? row.product.specifications.pack_size + ' ' : ''}${row.unit}` },
  ];

  return (
    <div>
      <PageHeader title="Inventory Management" subtitle="Current stock levels across all products" />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[{ label: 'Low Stock Only', type: 'toggle', value: lowStock, onChange: (v) => { setLowStock(v); setPage(1); } }]}
      />
      <DataTable
        columns={columns}
        data={items}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/we/inventory/${row.product_id || row.id}`)}
        emptyMessage="No inventory records found"
      />
    </div>
  );
}
