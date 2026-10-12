import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getDefaultRoute = (role) => {
  switch (role) {
    case "tenis":
      return "/admin/tenis";
    case "padel":
      return "/admin/padel";
    case "pelota_paleta":
      return "/admin/pelota-paleta";
    case "salon":
      return "/admin/salon";
    case "cantina":
      return "/admin/cantina";
    case "tienda":
      return "/admin/indumentaria";
    case "juveniles":
      return "/admin/infantiles";
    case "secretaria":
    case "adminBirchenz":
    default:
      return "/admin";
  }
};

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-5">Cargando permisos...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = user.role || user.roleName || "";
  const isSuperAdmin = role === "adminBirchenz";
  const hasAccess =
    isSuperAdmin || allowedRoles.length === 0 || allowedRoles.includes(role);

  if (!hasAccess) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return <Outlet />;
}
