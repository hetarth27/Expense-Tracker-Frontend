import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';

// ─── Types ────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const toast = {
    success: (msg: string, dur?: number) => addToast(msg, 'success', dur),
    error: (msg: string, dur?: number) => addToast(msg, 'error', dur),
    info: (msg: string, dur?: number) => addToast(msg, 'info', dur),
    warning: (msg: string, dur?: number) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
};

// ─── Toast Item ───────────────────────────────────────────
const toastStyles: Record<ToastType, { bar: string; icon: string; label: string }> = {
  success: { bar: 'bg-emerald-400', icon: '✓', label: 'text-emerald-400' },
  error:   { bar: 'bg-rose-400',    icon: '✕', label: 'text-rose-400' },
  warning: { bar: 'bg-amber-400',   icon: '!', label: 'text-amber-400' },
  info:    { bar: 'bg-brand-400',   icon: 'i', label: 'text-brand-400' },
};

const ToastItem = ({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) => {
  const [visible, setVisible] = useState(false);
  const style = toastStyles[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 pr-10 rounded-xl
        bg-surface-800 border border-surface-600
        shadow-2xl shadow-black/40
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
      style={{ minWidth: '280px', maxWidth: '380px' }}
    >
      {/* Colored left bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${style.bar}`} />

      {/* Icon */}
      <span className={`text-sm font-bold mt-0.5 shrink-0 ${style.label}`}>
        {style.icon}
      </span>

      {/* Message */}
      <p className="text-sm text-slate-200 leading-relaxed">{toast.message}</p>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden bg-surface-700">
          <div
            className={`h-full ${style.bar} opacity-50`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Container ────────────────────────────────────────────
const ToastContainer = ({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) => {
  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
};
