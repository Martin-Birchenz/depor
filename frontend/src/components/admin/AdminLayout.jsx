import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = ({ accessibleItems = [], role, logout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light">
      <aside
        className="bg-dark text-white p-3 d-flex flex-column flex-shrink-0"
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-md-4">
          <div className="text-start text-md-center w-100">
            <h5 className="fw-bold mb-0 text-white">El Depor Admin</h5>
            <small className="text-secondary text-uppercase d-block">
              {role === "admin" || role === "adminBirchenz"
                ? "Administración General"
                : role}
            </small>
          </div>

          <button
            className="btn btn-outline-light btn-sm d-md-none px-2 py-1"
            type="button"
            onClick={toggleMenu}
            aria-label="Abrir menú"
          >
            {menuOpen ? (
              <span className="fs-5 lh-1">✕</span>
            ) : (
              <span className="fs-5 lh-1">☰</span>
            )}
          </button>
        </div>

        <div
          className={`${
            menuOpen ? "d-flex" : "d-none"
          } d-md-flex flex-column flex-grow-1 mt-3 mt-md-0`}
        >
          <nav className="nav nav-pills flex-column gap-1 flex-grow-1">
            {accessibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                onClick={closeMenu}
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
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow-1 p-2 p-sm-3 p-md-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
