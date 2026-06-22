import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrencyCompact } from '../../utils/format';

export default function CREMCustomers() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['crem-customers', search, page],
    queryFn: () => api.get('/customers', { search, my_customers: true, page, limit: 20 }),
  });

  const customers = data?.customers || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'phone', label: 'Phone' },
    { key: 'outstanding_amount', label: 'Outstanding', render: (v) => formatCurrencyCompact(v) },
    { key: 'last_order_date', label: 'Last Order', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader title="My Customers" subtitle="Customers assigned to you" />
      <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} className="mb-4" />
      <DataTable
        columns={columns}
        data={customers}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/crem/customers/${row.id}`)}
        emptyMessage="No customers assigned to you"
      />
    </div>
  );
}
