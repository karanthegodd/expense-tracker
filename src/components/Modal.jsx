import { useEffect } from 'react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm,
  type = 'confirm',
  children 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="glass-card p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-3xl leading-none transition-colors"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {message && (
          <p className="text-white/90 mb-6 text-lg leading-relaxed">{message}</p>
        )}

        {children && <div className="mb-6">{children}</div>}

        <div className="flex gap-3 justify-end">
          {(type === 'confirm' || type === 'danger') && (
            <>
              <Button variant="outline" onClick={onClose}>
                {cancelText || 'No'}
              </Button>
              <Button variant={type === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
                {confirmText || 'Yes'}
              </Button>
            </>
          )}
          {type === 'alert' && (
            <Button variant="primary" onClick={onClose} className="w-full">
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

