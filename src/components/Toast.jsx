import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: '✓',
      border: 'border-green-400',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: '✕',
      border: 'border-red-400',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: 'ℹ',
      border: 'border-blue-400',
    },
    warning: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      icon: '⚠',
      border: 'border-orange-400',
    },
  };

  const config = types[type] || types.success;

  return (
    <div
      className={`${config.bg} ${config.border} border-2 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md animate-slide-in-right z-50`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-2xl font-bold">{config.icon}</span>
      <p className="flex-1 font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors text-xl font-bold leading-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

