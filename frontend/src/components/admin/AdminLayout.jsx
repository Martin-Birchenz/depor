import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const role = user?.role || user?.roleName || "";

  const navItems = [
    {
      label: "Dashboard",
      to: "/admin",
      roles: ["adminBirchenz", "secretaria"],
    },
    {
      label: "Socios",
      to: "/admin/socios",
      roles: ["adminBirchenz", "secretaria"],
    },
    {
      label: "Colonia",
      to: "/admin/colonia",
      roles: ["adminBirchenz", "secretaria"],
    },
    {
      label: "Indumentaria",
      to: "/admin/indumentaria",
      roles: ["adminBirchenz", "tienda"],
    },
    {
      label: "Cantina",
      to: "/admin/cantina",
      roles: ["adminBirchenz", "cantina"],
    },
    {
      label: "Infantiles",
      to: "/admin/infantiles",
      roles: ["adminBirchenz", "juveniles"],
    },
    { label: "Tenis", to: "/admin/tenis", roles: ["adminBirchenz", "tenis"] },
    { label: "Pádel", to: "/admin/padel", roles: ["adminBirchenz", "padel"] },
    {
      label: "Pelota Paleta",
      to: "/admin/pelota-paleta",
      roles: ["adminBirchenz", "pelota_paleta"],
    },
    {
      label: "Salón y Quinchos",
      to: "/admin/salon",
      roles: ["adminBirchenz", "salon"],
    },
  ];

  const accessibleItems = navItems.filter(
    (item) => role === "adminBirchenz" || item.roles.includes(role),
  );

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light">
      <aside
        className="bg-dark text-white p-3 d-flex flex-column flex-shrink-0"
        style={{ width: "100%", maxWidth: "100%", mdWidth: "260px" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 text-md-center">
          <div>
            <h5 className="fw-bold mb-0 text-white">Administración</h5>
            <small className="text-secondary text-uppercase">{role}</small>
          </div>
        </div>

        <nav className="nav nav-pills flex-column gap-1">
          {accessibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `nav-link text-white py-2 px-3 rounded-2 ${
                  isActive ? "active bg-secondary fw-bold" : "hover-light"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-3 mt-3 border-top border-secondary">
          <button
            onClick={logout}
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-grow-1 p-2 p-sm-3 p-md-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
