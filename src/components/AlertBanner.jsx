import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

const VARIANTS = {
  warning: { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon_color: 'text-amber-500' },
  error: { icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon_color: 'text-red-500' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon_color: 'text-blue-500' },
  success: { icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon_color: 'text-emerald-500' },
};

export default function AlertBanner({ variant = 'info', title, description, action, dismissible = true }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const { icon: Icon, bg, text, icon_color } = VARIANTS[variant] || VARIANTS.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border mb-6 ${bg}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icon_color}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${text}`}>{title}</p>}
        {description && <p className={`text-sm mt-0.5 ${text} opacity-90`}>{description}</p>}
        {action && (
          <Link href={action.href}>
            <a className={`text-sm font-medium underline mt-1 inline-block ${text}`}>{action.label}</a>
          </Link>
        )}
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className={`p-1 rounded hover:bg-black/10 ${text}`}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
