import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const DEFAULT_DURATIONS = {
  success: 3500,
  info: 3500,
  warning: 4500,
  error: 5500,
};

const TOAST_ICONS = {
  success: 'bi-check-circle-fill text-success',
  error: 'bi-x-circle-fill text-danger',
  warning: 'bi-exclamation-triangle-fill text-warning',
  info: 'bi-info-circle-fill text-primary',
};

const TOAST_BORDER_CLASSES = {
  success: 'border-success',
  error: 'border-danger',
  warning: 'border-warning',
  info: 'border-primary',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = null, duration = null) => {
    if (!message) return;

    const normalizedType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
    const messageStr = typeof message === 'string' ? message : String(message);

    // Deduplication check: ignore identical message + type within 1200ms
    const dedupKey = `${normalizedType}:${messageStr}`;
    const now = Date.now();
    const lastTime = recentToastsRef.current.get(dedupKey) || 0;
    if (now - lastTime < 1200) {
      return;
    }
    recentToastsRef.current.set(dedupKey, now);

    // Cleanup old map entries
    if (recentToastsRef.current.size > 50) {
      recentToastsRef.current.clear();
    }

    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timeoutDuration = duration || DEFAULT_DURATIONS[normalizedType] || 4000;

    const defaultTitle = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    }[normalizedType];

    const newToast = {
      id,
      message: messageStr,
      type: normalizedType,
      title: title || defaultTitle,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, timeoutDuration);
  }, [removeToast]);

  const showSuccess = useCallback((message, title) => showToast(message, 'success', title), [showToast]);
  const showError = useCallback((message, title) => showToast(message, 'error', title), [showToast]);
  const showWarning = useCallback((message, title) => showToast(message, 'warning', title), [showToast]);
  const showInfo = useCallback((message, title) => showToast(message, 'info', title), [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Toast Viewport Container */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1100, maxWidth: '420px', width: '100%', pointerEvents: 'none' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show shadow-lg border-start border-4 ${TOAST_BORDER_CLASSES[t.type]} mb-2 bg-white`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ pointerEvents: 'auto', minWidth: '280px' }}
          >
            <div className="toast-header bg-light py-2">
              <i className={`bi ${TOAST_ICONS[t.type]} me-2 fs-6`}></i>
              <strong className="me-auto text-dark">{t.title}</strong>
              <small className="text-muted ms-2">{t.time}</small>
              <button
                type="button"
                className="btn-close ms-2"
                onClick={() => removeToast(t.id)}
                aria-label="Close"
              ></button>
            </div>
            <div
              className="toast-body py-2 text-secondary"
              style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', wordBreak: 'break-word' }}
            >
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
