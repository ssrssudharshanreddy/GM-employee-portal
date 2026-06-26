import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusChip from '../../components/StatusChip';
import RoleBadge from '../../components/RoleBadge';
import { formatDate } from '../../utils/format';
import { Plus } from 'lucide-react';

const ROLE_OPTIONS = ['CEO','CRE','CREM','AE','WE','WS'].map(r => ({ value: r, label: r }));

export default function CEOEmployees() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, role, page],
    queryFn: () => api.get('/employees', { search, role: role || undefined, page, limit: 20 }),
  });

  const employees = data?.employees || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email', render: (v) => v || '—' },
    { key: 'employee_code', label: 'Emp Code', render: (v) => v || '—' },
    { key: 'role', label: 'Role', render: (v) => <RoleBadge role={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusChip status={v} /> },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'created_at', label: 'Joined', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader
        title="Employee Management"
        subtitle="All employees, their roles and status"
        actions={
          <Link href="/ceo/employees/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700">
              <Plus className="w-4 h-4" /> New Employee
            </Link>
        }
      />
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        className="mb-4"
        filters={[
          {
            type: 'select', value: role, onChange: (v) => { setRole(v); setPage(1); },
            placeholder: 'All Roles', options: ROLE_OPTIONS,
          },
        ]}
      />
      <DataTable
        columns={columns}
        data={employees}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/ceo/employees/${row.id}`)}
        emptyMessage="No employees found"
      />
    </div>
  );
}
