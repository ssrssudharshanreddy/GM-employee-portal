import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';
import RoleBadge from '../../components/RoleBadge';
import { formatDate } from '../../utils/format';

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/auth/me'),
  });

  const update = useMutation({
    mutationFn: (data) => api.patch('/employees/me', data),
    onSuccess: () => {
      qc.invalidateQueries(['my-profile']);
      setEditing(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => setError(err.message),
  });

  function startEdit() {
    const p = profile?.profile || profile;
    setForm({ full_name: p?.full_name || '', phone: p?.phone || '' });
    setEditing(true);
    setError('');
  }

  function handleSave(e) {
    e.preventDefault();
    update.mutate(form);
  }

  const p = profile?.profile || profile;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and update your employee profile"
        actions={!editing && (
          <button
            onClick={startEdit}
            className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700"
          >
            Edit Profile
          </button>
        )}
      />

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-card p-6 animate-pulse">
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-5 bg-surface-100 rounded w-3/4" />)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold text-text-primary mb-6">Account Information</h2>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                  <input
                    value={form.full_name || ''}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
                  <input
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={update.isPending} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50">
                    {update.isPending ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-medium bg-surface-100 text-text-secondary rounded-md hover:bg-surface-200">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="space-y-4">
                {[
                  ['Full Name', p?.full_name || '—'],
                  ['Email', p?.email || user?.email || '—'],
                  ['Phone', p?.phone || '—'],
                  ['Role', <RoleBadge role={p?.role || user?.role} />],
                  ['Status', p?.status || 'ACTIVE'],
                  ['Department', p?.department || '—'],
                  ['Joined', p?.created_at ? formatDate(p.created_at) : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-4">
                    <dt className="text-sm text-text-muted w-28 flex-shrink-0">{label}</dt>
                    <dd className="text-sm font-medium text-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-card p-6 h-fit">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-3xl font-bold mb-4">
                {(p?.full_name || user?.email || '?')[0]?.toUpperCase()}
              </div>
              <p className="font-semibold text-text-primary">{p?.full_name || '—'}</p>
              <p className="text-sm text-text-muted">{p?.email || user?.email}</p>
              <RoleBadge role={p?.role || user?.role} className="mt-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
