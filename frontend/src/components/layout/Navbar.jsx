import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top border-bottom border-dark">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold d-flex align-items-center">
          <img
            src="/logo-deportivo.png"
            alt="Escudo Oficial Club Deportivo Nogoyá"
            width="45"
            className="me-2"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          DEPORTIVO NOGOYÁ
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active text-white" : ""}`
                }
              >
                Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/deportes"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active text-white" : ""}`
                }
              >
                Deportes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/historia"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active text-white" : ""}`
                }
              >
                Historia
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/indumentaria"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active text-white" : ""}`
                }
              >
                Indumentaria
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/colonia"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active text-white" : ""}`
                }
              >
                Colonia
              </NavLink>
            </li>
            <li className="nav-item">
              <Link
                to="/socios"
                className="btn btn-outline-light ms-lg-3 my-2 my-lg-0"
              >
                Hacete socio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin/login"
                className="nav-link text-secondary ms-lg-2 small"
              >
                Acceso Personal
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
