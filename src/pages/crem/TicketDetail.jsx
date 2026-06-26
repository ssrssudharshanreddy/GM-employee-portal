import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { formatDateTime } from '../../utils/format';
import { Send, ArrowUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function CREMTicketDetail() {
  const [, params] = useRoute('/crem/tickets/:id');
  const id = params?.id;
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reply, setReply] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/tickets/${id}`),
    enabled: !!id,
  });

  const addMessage = useMutation({
    mutationFn: (content) => api.post(`/tickets/${id}/messages`, { content }),
    onSuccess: () => { qc.invalidateQueries(['ticket', id]); setReply(''); },
  });

  const updateStatus = useMutation({
    mutationFn: (status) => api.patch(`/tickets/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries(['ticket', id]),
  });

  const escalate = useMutation({
    mutationFn: () => api.post(`/tickets/${id}/escalate`, {}),
    onSuccess: () => qc.invalidateQueries(['ticket', id]),
  });

  const ticket = data?.ticket || data;
  const messages = ticket?.messages || [];

  if (isLoading) return <div className="animate-pulse"><div className="h-48 bg-surface-100 rounded-lg" /></div>;
  if (!ticket) return <div className="text-center py-12 text-text-muted">Ticket not found</div>;

  return (
    <div>
      <Link href="/crem/tickets" className="text-sm text-brand-600 hover:underline">← Tickets</Link>
      <PageHeader
        title={ticket.subject}
        subtitle={`${ticket.ticket_number} · ${ticket.company_name}`}
        actions={
          <div className="flex gap-2">
            {ticket.status === 'OPEN' && (
              <button onClick={() => updateStatus.mutate('IN_PROGRESS')} className="px-3 py-2 text-sm font-medium bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200">
                In Progress
              </button>
            )}
            {['OPEN','IN_PROGRESS'].includes(ticket.status) && ['CRE','CREM'].includes(user?.role) && (
              <button onClick={() => escalate.mutate()} className="px-3 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-1">
                <ArrowUp className="w-4 h-4" /> Escalate
              </button>
            )}
            {ticket.status === 'IN_PROGRESS' && (
              <button onClick={() => updateStatus.mutate('RESOLVED')} className="px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700">
                Mark Resolved
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Conversation */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-base font-semibold mb-4">Conversation</h2>
            <div className="space-y-4 mb-6">
              {messages.length === 0 ? (
                <p className="text-sm text-text-muted">No messages yet</p>
              ) : (
                messages.map((msg, i) => {
                  const isEmployee = msg.sender_role !== 'CUSTOMER';
                  return (
                    <div key={i} className={`flex gap-3 ${isEmployee ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isEmployee ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-700'}`}>
                        {(msg.sender_name || '?')[0]?.toUpperCase()}
                      </div>
                      <div className={`max-w-xs lg:max-w-md ${isEmployee ? 'items-end' : ''}`}>
                        <div className={`rounded-xl p-3 text-sm ${isEmployee ? 'bg-brand-600 text-white' : 'bg-surface-100 text-text-primary'}`}>
                          {msg.content}
                        </div>
                        <p className="text-xs text-text-muted mt-1">{formatDateTime(msg.created_at)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply */}
            {!['RESOLVED','CLOSED'].includes(ticket.status) && (
              <div className="flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && reply.trim() && addMessage.mutate(reply.trim())}
                  placeholder="Type a reply…"
                  className="flex-1 px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={() => reply.trim() && addMessage.mutate(reply.trim())}
                  disabled={!reply.trim() || addMessage.isPending}
                  className="p-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 h-fit">
          <h2 className="text-sm font-semibold mb-4">Ticket Info</h2>
          {[
            ['Status', <StatusChip status={ticket.status} />],
            ['Priority', ticket.priority || '—'],
            ['Category', ticket.category?.replace(/_/g,' ') || '—'],
            ['Customer', ticket.company_name],
            ['Assigned To', ticket.assigned_to_name || 'Unassigned'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-surface-100 last:border-0 text-sm">
              <span className="text-text-muted">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
