const ROLE_STYLES = {
  CEO: 'bg-purple-100 text-purple-700',
  CRE: 'bg-blue-100 text-blue-700',
  CREM: 'bg-cyan-100 text-cyan-700',
  AE: 'bg-green-100 text-green-700',
  WE: 'bg-orange-100 text-orange-700',
  WS: 'bg-yellow-100 text-yellow-700',
  CUSTOMER: 'bg-slate-100 text-slate-700',
};

const ROLE_LABELS = {
  CEO: 'CEO',
  CRE: 'CRE',
  CREM: 'CRE Manager',
  AE: 'Accounts Exec.',
  WE: 'Warehouse Exec.',
  WS: 'Warehouse Staff',
  CUSTOMER: 'Customer',
};

export default function RoleBadge({ role, className = '' }) {
  if (!role) return null;
  const styles = ROLE_STYLES[role] || 'bg-slate-100 text-slate-700';
  const label = ROLE_LABELS[role] || role;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles} ${className}`}>
      {label}
    </span>
  );
}
