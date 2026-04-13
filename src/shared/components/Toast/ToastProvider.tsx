"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import styles from './Toast.module.css';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  description?: string;
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info', description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info', description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, description }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]} glass-panel`}>
            <div className={styles.toastContent}>
              <div className={styles.message}>{toast.message}</div>
              {toast.description && <div className={styles.description}>{toast.description}</div>}
            </div>
            <button 
              className={styles.closeBtn} 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
