import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDate } from '../../utils/format';

const STAGES = ['NEW','CONTACTED','FOLLOW_UP','CONVERTED','LOST'];

export default function CREMLeadDetail() {
  const [, params] = useRoute('/crem/leads/:id');
  const id = params?.id;
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.get(`/leads/${id}`),
    enabled: !!id,
  });

  const updateStage = useMutation({
    mutationFn: (stage) => api.patch(`/leads/${id}`, { stage }),
    onSuccess: () => qc.invalidateQueries(['lead', id]),
  });

  const addNote = useMutation({
    mutationFn: (content) => api.post(`/leads/${id}/notes`, { content }),
    onSuccess: () => { qc.invalidateQueries(['lead', id]); setNote(''); },
  });

  const lead = data?.lead || data;

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!lead) return <div className="text-center py-12 text-text-muted">Lead not found</div>;

  return (
    <div>
      <Link href="/crem/leads" className="text-sm text-brand-600 hover:underline">← Leads</Link>
      <PageHeader
        title={lead.company_name}
        subtitle={lead.contact_person}
        actions={<StatusChip status={lead.stage} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Details */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Lead Information</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Company', lead.company_name],
                ['Contact', lead.contact_person],
                ['Phone', lead.phone || '—'],
                ['Email', lead.email || '—'],
                ['Source', lead.source?.replace(/_/g,' ') || '—'],
                ['City', lead.city || '—'],
                ['Next Follow-Up', formatDate(lead.next_follow_up)],
                ['Created', formatDate(lead.created_at)],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-text-muted">{k}</dt><dd className="font-medium mt-0.5">{v}</dd></div>
              ))}
            </dl>
          </div>

          {/* Add Note */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-3">Add a Note</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this lead…"
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <button
              onClick={() => note.trim() && addNote.mutate(note.trim())}
              disabled={!note.trim() || addNote.isPending}
              className="mt-2 px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
            >
              {addNote.isPending ? 'Adding…' : 'Add Note'}
            </button>
          </div>

          {/* Notes History */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Activity Notes</h2>
            {(lead.notes || []).length === 0 ? (
              <p className="text-sm text-text-muted">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {(lead.notes || []).map((n, i) => (
                  <div key={i} className="p-3 bg-surface-50 rounded-lg">
                    <p className="text-sm text-text-primary">{n.content}</p>
                    <p className="text-xs text-text-muted mt-1">{formatDate(n.created_at)} · {n.author_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stage Control */}
        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-4">Update Stage</h2>
          <div className="space-y-2">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => updateStage.mutate(stage)}
                disabled={lead.stage === stage || updateStage.isPending}
                className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                  lead.stage === stage
                    ? 'bg-brand-600 text-white cursor-default'
                    : 'bg-surface-100 text-text-secondary hover:bg-surface-200'
                }`}
              >
                {stage.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
