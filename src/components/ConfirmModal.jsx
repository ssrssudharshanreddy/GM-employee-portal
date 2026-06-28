import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  consequenceText,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading,
  children,
}) {
  if (!open) return null;

  const btnClass = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-brand-600 hover:bg-brand-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
              {consequenceText && (
                <p className="text-sm text-text-secondary mt-2">{consequenceText}</p>
              )}
            </div>
          </div>
          {children && <div className="mt-6">{children}</div>}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-surface-100 hover:bg-surface-200 rounded-md"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 ${btnClass}`}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
