import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    {
      label: "Panel General",
      path: "/admin",
      roles: ["adminBirchenz", "admin", "secretaria", "pileta", "canchas"],
    },
    {
      label: "Padrón de Socios",
      path: "/admin/socios",
      roles: ["adminBirchenz", "admin", "secretaria"],
    },
    {
      label: "Turnero de Canchas",
      path: "/admin/canchas",
      roles: ["adminBirchenz", "admin", "canchas", "secretaria"],
    },
    {
      label: "Colonia y Pileta",
      path: "/admin/colonia",
      roles: ["adminBirchenz", "admin", "pileta", "secretaria"],
    },
    {
      label: "Tienda e Indumentaria",
      path: "/admin/indumentaria",
      roles: ["adminBirchenz", "admin", "secretaria"],
    },
  ];

  const filteredMenu = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role),
  );

  return (
    <div className="d-flex min-vh-100 bg-light">
      <aside
        className="bg-black text-white p-3 d-flex flex-column shadow"
        style={{ width: "260px", minHeight: "100vh" }}
      >
        <div className="border-bottom border-secondary pb-3 mb-3 text-center">
          <h5 className="socios-title mb-1 text-white">Panel Deportivo</h5>
          <span
            className="badge bg-secondary text-uppercase font-monospace"
            style={{ fontSize: "0.7rem" }}
          >
            {user?.role || "Personal"}
          </span>
        </div>

        <nav className="nav nav-pills flex-column gap-1 flex-grow-1">
          {filteredMenu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `nav-link text-white small py-2 px-3 rounded ${
                  isActive ? "bg-secondary fw-bold" : "opacity-75"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-top border-secondary pt-3 mt-auto">
          <div className="text-white-50 small mb-2 text-truncate">
            Sesión:{" "}
            <strong className="text-white">
              {user?.username || user?.email}
            </strong>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm w-100 fw-bold"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="flex-grow-1 d-flex flex-column">
        <header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center shadow-sm">
          <h5 className="mb-0 fw-bold text-dark">Gestión Interna del Club</h5>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-dark"
          >
            Ver Web Pública ↗
          </a>
        </header>

        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
