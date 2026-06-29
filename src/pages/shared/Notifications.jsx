import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatRelative } from '../../utils/format';
import { Bell, Trash2 } from 'lucide-react';

export default function Notifications() {
  const qc = useQueryClient();
  const [showUnread, setShowUnread] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', showUnread],
    queryFn: () => api.get('/notifications', { unread_only: showUnread ? true : undefined, limit: 50 }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read', {}),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const items = data?.notifications || data?.data || [];

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Your in-app notifications"
        actions={
          <button
            onClick={() => markAllRead.mutate()}
            className="px-3 py-2 text-sm font-medium border border-surface-200 rounded-md hover:bg-surface-100 text-text-secondary"
          >
            Mark all read
          </button>
        }
      />

      <div className="flex gap-2 mb-4">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            onClick={() => setShowUnread(v)}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              showUnread === v ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-text-secondary hover:bg-surface-100'
            }`}
          >
            {v ? 'Unread' : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-card divide-y divide-surface-200">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-surface-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-100 rounded w-1/2" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center">
            <Bell className="w-10 h-10 text-surface-200 mb-3" />
            <p className="text-text-muted text-sm">No notifications</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead.mutate(n.id)}
              className={`p-4 flex gap-3 cursor-pointer group relative hover:bg-surface-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-surface-200' : 'bg-brand-600'}`} />
              <div className="min-w-0 pr-8">
                <p className={`text-sm ${n.is_read ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>{n.title}</p>
                {n.body && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>}
                <p className="text-xs text-text-muted mt-1">{formatRelative(n.created_at)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification.mutate(n.id);
                }}
                className="absolute top-4 right-4 p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
