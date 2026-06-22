import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { formatCurrencyCompact, formatDate } from '../../utils/format';
import { BarChart2, Download } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'revenue', label: 'Revenue Summary' },
  { id: 'collections', label: 'Collections Performance' },
  { id: 'warehouse', label: 'Warehouse Performance' },
  { id: 'employee_productivity', label: 'Employee Productivity' },
  { id: 'customer_risk', label: 'Customer Risk Profile' },
];

export default function CEOReports() {
  const [selectedReport, setSelectedReport] = useState('revenue');

  const { data, isLoading } = useQuery({
    queryKey: ['ceo-report', selectedReport],
    queryFn: () => api.get(`/reports/ceo/${selectedReport}`),
  });

  async function handleExport() {
    try {
      const response = await fetch(`/api/reports/ceo/${selectedReport}/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('gm_access_token')}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
    } catch {
      alert('Export failed');
    }
  }

  const reportData = data?.data || data?.rows || [];

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business intelligence across all operations"
        actions={
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-surface-200 rounded-md hover:bg-surface-100 text-text-secondary"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {/* Report Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r.id)}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              selectedReport === r.id
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-surface-200 text-text-secondary hover:bg-surface-100'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-semibold text-text-primary">
            {REPORT_TYPES.find(r => r.id === selectedReport)?.label}
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-surface-100 animate-pulse rounded" />)}
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-12 text-text-muted">No report data available for this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  {Object.keys(reportData[0] || {}).map(key => (
                    <th key={key} className="px-3 py-2 text-left text-xs font-semibold uppercase text-text-muted whitespace-nowrap">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, i) => (
                  <tr key={i} className="border-b border-surface-100 hover:bg-surface-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-text-primary">{String(val ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
