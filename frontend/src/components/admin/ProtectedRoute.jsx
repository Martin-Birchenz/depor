import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-dark" role="status"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-danger fw-bold">Acceso Denegado</h2>
        <p className="text-muted">
          Tu rol ({user.role}) no tiene permisos para acceder a este módulo.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
