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
    <div className="d-flex min-vh-100 bg-light">
      <aside
        className="bg-dark text-white p-3 d-flex flex-column"
        style={{ width: "260px" }}
      >
        <div className="mb-4 text-center">
          <h5 className="fw-bold mb-0 text-white">El Depor Admin</h5>
          <small className="text-secondary text-uppercase">{role}</small>
        </div>

        <nav className="nav nav-pills flex-column flex-grow-1 gap-1">
          {accessibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "active bg-secondary" : "hover-light"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="btn btn-outline-danger btn-sm w-100 mt-auto"
        >
          Cerrar Sesión
        </button>
      </aside>

      <main className="flex-grow-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
