import React from 'react';
import Toast, { PropsToast } from './Toast';
import './ToastContainer.css';

interface PropsContainerToast {
  toasts: PropsToast[];
  aoRemoverToast: (id: string) => void;
}

const ContainerToast: React.FC<PropsContainerToast> = ({ toasts, aoRemoverToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notificações">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          aoFechar={aoRemoverToast}
        />
      ))}
    </div>
  );
};

export default ContainerToast;
