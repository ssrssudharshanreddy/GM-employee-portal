import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

export default function CREApplicationDetail() {
  const [, params] = useRoute('/cre/applications/:id');
  const id = params?.id;
  const { user } = useAuth();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.get(`/applications/${id}`),
    enabled: !!id,
  });

  const action = useMutation({
    mutationFn: ({ act, reason, note }) => api.patch(`/applications/${id}/${act}`, { reason, note }),
    onSuccess: () => {
      qc.invalidateQueries(['application', id]);
      setModal(null);
      if (modal === 'approve') navigate(-1);
    },
  });

  const app = data?.application || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-64 bg-surface-100 rounded-lg" /></div>;
  if (!app) return <div className="text-center py-12 text-text-muted">Application not found</div>;

  const canAct = ['PENDING_CRE_REVIEW', 'ACTION_REQUIRED'].includes(app.status);
  const isCRE = ['CRE', 'CEO'].includes(user?.role);

  return (
    <div>
      <Link href="/cre/applications"><a className="text-sm text-brand-600 hover:underline">← Applications</a></Link>
      <PageHeader
        title={app.company_name}
        subtitle={`Application submitted on ${formatDate(app.created_at)}`}
        actions={
          canAct && isCRE && (
            <div className="flex gap-2">
              <button onClick={() => setModal('request-info')} className="px-3 py-2 text-sm font-medium border border-surface-200 rounded-md hover:bg-surface-100">
                Request Info
              </button>
              <button onClick={() => setModal('reject')} className="px-3 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                Reject
              </button>
              <button onClick={() => setModal('approve')} className="px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700">
                Approve
              </button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Company Details</h2>
              <StatusChip status={app.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Company', app.company_name],
                ['Contact Person', app.contact_person],
                ['Email', app.email],
                ['Phone', app.phone],
                ['GSTIN', app.gstin || '—'],
                ['City', app.city || '—'],
                ['State', app.state || '—'],
                ['Business Type', app.business_type || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-text-muted text-xs">{k}</dt>
                  <dd className="font-medium mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Documents</h2>
            {(app.documents || []).length === 0 ? (
              <p className="text-sm text-text-muted">No documents uploaded</p>
            ) : (
              <div className="divide-y divide-surface-200">
                {(app.documents || []).map((doc, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{doc.document_type}</p>
                      <p className="text-xs text-text-muted">{formatDate(doc.uploaded_at)}</p>
                    </div>
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold mb-3">Application Timeline</h2>
            <div className="space-y-3">
              {(app.timeline || []).map((event, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{event.status}</p>
                    <p className="text-xs text-text-muted">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <ConfirmModal
        open={modal === 'approve'}
        title="Approve Application"
        consequenceText={`Approving ${app.company_name} will advance them to the Accounts Executive for credit setup.`}
        confirmLabel="Yes, Approve"
        confirmVariant="primary"
        loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await action.mutateAsync({ act: 'approve' }); setLoading(false); }}
      />
      <ConfirmModal
        open={modal === 'reject'}
        title="Reject Application"
        consequenceText={`Rejecting ${app.company_name} will permanently reject their application. They will be notified.`}
        confirmLabel="Yes, Reject"
        confirmVariant="danger"
        loading={loading}
        onClose={() => setModal(null)}
        onConfirm={async () => { setLoading(true); await action.mutateAsync({ act: 'reject', reason: note }); setLoading(false); }}
      />
    </div>
  );
}
