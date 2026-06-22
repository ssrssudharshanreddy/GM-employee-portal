import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatDateTime } from '../../utils/format';
import FilterBar from '../../components/FilterBar';

export default function CEOAudit() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', search, page],
    queryFn: () => api.get('/reports/audit-logs', { search, page, limit: 30 }),
  });

  const logs = data?.logs || data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 30) || 1;

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Full system-wide audit trail" />
      <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} className="mb-4" />

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              {['Timestamp', 'Actor', 'Action', 'Entity', 'Entity ID', 'Details'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-100">
                  {[1,2,3,4,5,6].map(j => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-100 animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-text-muted">No audit logs found</td></tr>
            ) : (
              logs.map((log, i) => (
                <tr key={i} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap font-mono">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3 text-xs">{log.actor_name || log.actor_id || 'System'}</td>
                  <td className="px-4 py-3 text-xs font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-xs">{log.entity_type}</td>
                  <td className="px-4 py-3 text-xs font-mono">{log.entity_id}</td>
                  <td className="px-4 py-3 text-xs text-text-muted truncate max-w-[200px]">{log.details || log.changes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-surface-200 flex justify-between items-center text-sm text-text-muted">
            <span>{total} entries</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 border border-surface-200 rounded disabled:opacity-40">←</button>
              <span className="px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1 border border-surface-200 rounded disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
