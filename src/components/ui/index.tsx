import { ReactNode, useEffect } from 'react';

// ─── Modal ────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const modalSizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative max-h-[calc(100vh-1.5rem)] w-full overflow-y-auto ${modalSizes[size]} card border border-surface-600 shadow-app animate-scale-in sm:max-h-[calc(100vh-2rem)]`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-surface-700/50 p-4 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-surface-700 text-slate-300',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  danger: 'bg-rose-500/10 text-rose-400',
  info: 'bg-brand-500/10 text-brand-400',
};

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => (
  <span className={`badge ${badgeVariants[variant]} ${className}`}>{children}</span>
);

// ─── Spinner ──────────────────────────────────────────────
export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <svg
      className={`animate-spin ${sizes[size]} text-brand-400`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// ─── EmptyState ───────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon = '📭', title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <span className="text-4xl">{icon}</span>
    <h3 className="font-semibold text-slate-300">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

// ─── Error Alert ──────────────────────────────────────────
export const ErrorAlert = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, message, isLoading,
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-slate-400 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="btn-danger flex items-center gap-2"
      >
        {isLoading && <Spinner size="sm" />}
        Delete
      </button>
    </div>
  </Modal>
);

// ─── Stat Card ────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon?: string;
  iconBg?: string;
}

export const StatCard = ({ label, value, sub, subColor = 'text-slate-500', icon, iconBg }: StatCardProps) => (
  <div className="stat-card animate-slide-up">
    <div className="flex items-start justify-between">
      <p className="text-sm text-slate-400">{label}</p>
      {icon && (
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${iconBg || 'bg-surface-700'}`}>
          {icon}
        </span>
      )}
    </div>
    <p className="font-display text-2xl font-bold text-white tracking-tight">{value}</p>
    {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
  </div>
);
