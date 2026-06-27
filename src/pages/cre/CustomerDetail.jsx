import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate, formatCurrency, formatCurrencyCompact } from '../../utils/format';
import { UserCheck, ChevronDown, Check, Loader2 } from 'lucide-react';

export default function CRECustomerDetail() {
  const [, params] = useRoute('/cre/customers/:id');
  const id = params?.id;
  const qc = useQueryClient();

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Fetch customer details
  const { data, isLoading } = useQuery({
    queryKey: ['cre-customer', id],
    queryFn: () => api.get(`/customers/${id}`),
    enabled: !!id,
  });

  // Fetch CREMs (team members of this CRE)
  const { data: teamData } = useQuery({
    queryKey: ['cre-team'],
    queryFn: () => api.get('/employees', { role: 'CREM', limit: 100 }),
  });

  const assignMutation = useMutation({
    mutationFn: (cremId) => api.post(`/customers/${id}/assign-crem`, { crem_id: cremId }),
    onSuccess: () => {
      qc.invalidateQueries(['cre-customer', id]);
      qc.invalidateQueries(['cre-customers']);
      setAssignOpen(false);
      setAssignError('');
      setAssignSuccess('CREM assigned successfully!');
      setTimeout(() => setAssignSuccess(''), 3000);
    },
    onError: (err) => {
      setAssignError(err.message || 'Failed to assign CREM');
    },
  });

  const customer = data?.customer || data;
  const crems = teamData?.data ?? [];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Customer Detail" />
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!customer) return <div className="text-center py-12 text-text-muted">Customer not found</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link href="/cre/customers" className="text-sm text-brand-600 hover:underline">← Customers</Link>
      </div>

      <PageHeader
        title={customer.company_name}
        subtitle={customer.contact_person}
        actions={
          <div className="relative">
            <button
              id="assign-crem-btn"
              onClick={() => { setAssignOpen(o => !o); setAssignError(''); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Assign CREM
              <ChevronDown className={`w-4 h-4 transition-transform ${assignOpen ? 'rotate-180' : ''}`} />
            </button>

            {assignOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-modal border border-surface-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-100">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Select a CREM</p>
                  {customer.crem_name && (
                    <p className="text-xs text-text-muted mt-1">
                      Currently: <span className="font-medium text-text-primary">{customer.crem_name}</span>
                    </p>
                  )}
                </div>

                {crems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-text-muted">No CREMs available</div>
                ) : (
                  <ul className="py-1 max-h-56 overflow-y-auto">
                    {crems.map(crem => {
                      const isCurrent = customer.crem_id === crem.id;
                      return (
                        <li key={crem.id}>
                          <button
                            id={`crem-option-${crem.id}`}
                            disabled={assignMutation.isPending}
                            onClick={() => assignMutation.mutate(crem.id)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors disabled:opacity-50 ${
                              isCurrent ? 'text-brand-700 font-medium' : 'text-text-primary'
                            }`}
                          >
                            <span>{crem.full_name}</span>
                            <span className="flex items-center gap-1">
                              {assignMutation.isPending && assignMutation.variables === crem.id && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                              )}
                              {isCurrent && <Check className="w-3.5 h-3.5 text-brand-600" />}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {assignError && (
                  <div className="px-4 py-2 border-t border-surface-100 text-xs text-red-600 bg-red-50">{assignError}</div>
                )}
              </div>
            )}
          </div>
        }
      />

      {assignSuccess && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <Check className="w-4 h-4" /> {assignSuccess}
        </div>
      )}

      {/* Overlay to close dropdown on outside click */}
      {assignOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setAssignOpen(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Company Information</h2>
              <StatusChip status={customer.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ['Company Name', customer.company_name],
                ['Contact Person', customer.contact_person],
                ['Email', customer.email],
                ['Phone', customer.phone],
                ['GSTIN', customer.gstin || '—'],
                ['City', customer.city || '—'],
                ['CREM Assigned', customer.crem_name || 'Unassigned'],
                ['Joined', formatDate(customer.created_at)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-text-muted">{label}</dt>
                  <dd className={`text-sm font-medium mt-0.5 ${label === 'CREM Assigned' && !customer.crem_name ? 'text-amber-600' : 'text-text-primary'}`}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Credit Profile */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Credit Profile</h2>
            {[
              ['Credit Limit', formatCurrency(customer.credit_limit)],
              ['Used Credit', formatCurrency(customer.used_credit)],
              ['Available', formatCurrency((customer.credit_limit || 0) - (customer.used_credit || 0))],
              ['Credit Days', customer.credit_days ? `${customer.credit_days} days` : '—'],
              ['Outstanding', formatCurrencyCompact(customer.outstanding_amount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-surface-100 last:border-0">
                <span className="text-xs text-text-muted">{label}</span>
                <span className="text-xs font-semibold text-text-primary">{value}</span>
              </div>
            ))}
          </div>

          {/* CREM Assignment Card */}
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">CREM Assignment</h2>
            {customer.crem_name ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {customer.crem_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{customer.crem_name}</p>
                  <p className="text-xs text-text-muted">Assigned CREM</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <p className="text-xs text-text-muted">No CREM assigned yet</p>
                <button
                  onClick={() => setAssignOpen(true)}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  Assign now →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
