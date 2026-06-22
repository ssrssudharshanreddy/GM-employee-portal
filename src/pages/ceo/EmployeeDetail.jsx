import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { useState } from 'react';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import RoleBadge from '../../components/RoleBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate } from '../../utils/format';

export default function CEOEmployeeDetail() {
  const [, params] = useRoute('/ceo/employees/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.get(`/employees/${id}`),
    enabled: !!id,
  });

  const statusAction = useMutation({
    mutationFn: (action) => api.patch(`/employees/${id}/status`, { action }),
    onSuccess: () => { qc.invalidateQueries(['employee', id]); setModal(null); },
  });

  const resetPassword = useMutation({
    mutationFn: () => api.post(`/employees/${id}/reset-password`, {}),
    onSuccess: () => { setModal(null); alert('Password reset email sent.'); },
  });

  const emp = data?.employee || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!emp) return <div className="text-center py-12 text-text-muted">Employee not found</div>;

  return (
    <div>
      <Link href="/ceo/employees"><a className="text-sm text-brand-600 hover:underline">← Employees</a></Link>
      <PageHeader
        title={emp.full_name || emp.email}
        subtitle={emp.email}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setModal('reset-password')} className="px-3 py-2 text-sm font-medium border border-surface-200 rounded-md hover:bg-surface-100 text-text-secondary">
              Reset Password
            </button>
            {emp.status === 'ACTIVE' && (
              <button onClick={() => setModal('suspend')} className="px-3 py-2 text-sm font-medium bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200">
                Suspend
              </button>
            )}
            {(emp.status === 'SUSPENDED' || emp.status === 'BLOCKED') && (
              <button onClick={() => setModal('reactivate')} className="px-3 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                Reactivate
              </button>
            )}
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow-card p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
            {(emp.full_name || emp.email)?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{emp.full_name || '—'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={emp.role} />
              <StatusChip status={emp.status} />
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          {[
            ['Email', emp.email],
            ['Phone', emp.phone || '—'],
            ['Department', emp.department || '—'],
            ['Status', emp.status],
            ['Joined', formatDate(emp.created_at)],
            ['Employee ID', emp.id],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-text-muted">{label}</dt>
              <dd className="text-sm font-medium text-text-primary mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ConfirmModal
        open={modal === 'suspend'}
        title="Suspend Employee"
        consequenceText={`${emp.full_name} will be suspended and cannot log in.`}
        confirmLabel="Yes, Suspend"
        confirmVariant="danger"
        loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await statusAction.mutateAsync('suspend'); setLoading(false); }}
      />
      <ConfirmModal
        open={modal === 'reactivate'}
        title="Reactivate Employee"
        consequenceText={`${emp.full_name} will be reactivated and can log in again.`}
        confirmLabel="Yes, Reactivate"
        confirmVariant="primary"
        loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await statusAction.mutateAsync('reactivate'); setLoading(false); }}
      />
      <ConfirmModal
        open={modal === 'reset-password'}
        title="Reset Password"
        consequenceText={`A password reset email will be sent to ${emp.email}. They will need to set a new password.`}
        confirmLabel="Send Reset Email"
        loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await resetPassword.mutateAsync(); setLoading(false); }}
      />
    </div>
  );
}
