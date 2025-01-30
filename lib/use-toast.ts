"use client";

import * as React from "react";
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from "@/components/ui/toaster";

// Créer un contexte pour les toasts
const ToastContext = React.createContext<{ showToast: (message: string) => void } | undefined>(undefined);

// Composant ToastProviderComponent
export function ToastProviderComponent({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<{ id: number; message: string }[]>([]);

  // Fonction pour afficher un toast
  const showToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);

    // Supprimer le toast après 3 secondes
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id}>
            <ToastTitle>{toast.message}</ToastTitle>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

// Hook useToast
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProviderComponent");
  }
  return context;
}