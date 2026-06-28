const STATUS_STYLES = {
  // Customer / Application statuses
  APPLICATION_SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_CRE_REVIEW: 'bg-amber-100 text-amber-700',
  ACTION_REQUIRED: 'bg-red-100 text-red-700',
  PENDING_ACCOUNTS_REVIEW: 'bg-amber-100 text-amber-700',
  CREDIT_SETUP_IN_PROGRESS: 'bg-sky-100 text-sky-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
  BLOCKED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',

  // Order statuses
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-cyan-100 text-cyan-700',
  PROCESSING: 'bg-violet-100 text-violet-700',
  PICKING: 'bg-violet-100 text-violet-700',
  PICKED: 'bg-violet-100 text-violet-700',
  PACKING: 'bg-sky-100 text-sky-700',
  PACKED: 'bg-sky-100 text-sky-700',
  DISPATCHED: 'bg-amber-100 text-amber-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  STOCK_HOLD: 'bg-red-100 text-red-700',

  // Invoice statuses
  UNPAID: 'bg-amber-100 text-amber-700',
  PARTIALLY_PAID: 'bg-sky-100 text-sky-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',

  // Payment statuses
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700',
  PAYMENT_VERIFIED: 'bg-green-100 text-green-700',
  PAYMENT_REJECTED: 'bg-red-100 text-red-700',

  // Return statuses
  REQUESTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  RETURN_APPROVED: 'bg-emerald-100 text-emerald-700',
  PICKUP_SCHEDULED: 'bg-sky-100 text-sky-700',
  COLLECTED: 'bg-violet-100 text-violet-700',
  COMPLETED: 'bg-green-100 text-green-700',

  // Ticket statuses
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  ESCALATED: 'bg-red-100 text-red-700',

  // Lead statuses
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-sky-100 text-sky-700',
  FOLLOW_UP: 'bg-amber-100 text-amber-700',
  CONVERTED: 'bg-green-100 text-green-700',
  LOST: 'bg-slate-100 text-slate-600',

  // Task statuses
  PENDING_TASK: 'bg-amber-100 text-amber-700',
  COMPLETED_TASK: 'bg-green-100 text-green-700',
};

const LABEL_MAP = {
  PENDING_VERIFICATION: 'Pending Verification',
  PAYMENT_VERIFIED: 'Verified',
  PAYMENT_REJECTED: 'Rejected',
  APPLICATION_SUBMITTED: 'Submitted',
  PENDING_CRE_REVIEW: 'Pending CRE Review',
  ACTION_REQUIRED: 'Action Required',
  PENDING_ACCOUNTS_REVIEW: 'Pending AE Review',
  CREDIT_SETUP_IN_PROGRESS: 'Credit Setup',
  PARTIALLY_PAID: 'Partial',
  RETURN_APPROVED: 'Approved',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  STOCK_HOLD: 'Stock Hold',
  PENDING_TASK: 'Pending',
  COMPLETED_TASK: 'Completed',
};

export default function StatusChip({ status, className = '' }) {
  if (!status) return null;
  const styles = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  const label = LABEL_MAP[status] || status.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles} ${className}`}>
      {label}
    </span>
  );
}
