import { useState, useCallback, useMemo } from "react";
import { ToastContext } from "./ToastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "success", duration = 3500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);

      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({ addToast, removeToast }),
    [addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 9999 }}
      >
        {toasts.map((toast) => {
          const bgMap = {
            success: "bg-success text-white",
            error: "bg-danger text-white",
            warning: "bg-warning text-dark",
            info: "bg-primary text-white",
          };

          return (
            <div
              key={toast.id}
              className={`toast show align-items-center border-0 shadow-lg mb-2 ${
                bgMap[toast.type] || "bg-dark text-white"
              }`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="d-flex">
                <div className="toast-body fw-semibold">{toast.message}</div>
                <button
                  type="button"
                  className={`btn-close me-2 m-auto ${
                    toast.type === "warning" ? "" : "btn-close-white"
                  }`}
                  onClick={() => removeToast(toast.id)}
                  aria-label="Cerrar"
                ></button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
