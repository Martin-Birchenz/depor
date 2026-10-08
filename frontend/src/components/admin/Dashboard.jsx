import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          ¡Bienvenido, {user?.username || "Usuario"}!
        </h2>
        <p className="text-muted small">
          Panel de administración del Club Deportivo Nogoyá. Seleccioná un
          módulo del menú lateral para operar.
        </p>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <h6 className="text-muted small text-uppercase fw-bold">
              Rol Asignado
            </h6>
            <h4 className="fw-bold mb-0 text-dark">{user?.role}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
