import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../service/dashboard.service";

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeMembers: 0,
    totalMembers: 0,
    todayBookings: 0,
    confirmedBookings: 0,
    campRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      try {
        const data = await getDashboardStats();
        if (isMounted && data) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) console.error("Error cargando métricas:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Panel de Control</h2>
          <p className="text-muted small mb-0">
            Resumen operativo y estado general de las actividades del club.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Socios */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase">
              Padrón de Socios
            </span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <h1 className="fw-bold mb-0">
                {loading ? "..." : stats.activeMembers}
              </h1>
              <span className="text-muted small">
                / {stats.totalMembers} totales
              </span>
            </div>
            <span className="text-success small fw-bold mt-1">
              Activos y al día
            </span>
            <div className="mt-3">
              <Link
                to="/admin/socios"
                className="btn btn-sm btn-outline-dark fw-bold"
              >
                Gestionar padrón →
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase">
              Canchas (Hoy)
            </span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <h1 className="fw-bold mb-0">
                {loading ? "..." : stats.todayBookings}
              </h1>
              <span className="text-muted small">turnos agendados</span>
            </div>
            <span className="text-primary small fw-bold mt-1">
              {stats.confirmedBookings} confirmados
            </span>
            <div className="mt-3">
              <Link
                to="/admin/canchas"
                className="btn btn-sm btn-outline-dark fw-bold"
              >
                Ver turnero del día →
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <span className="text-muted small fw-bold text-uppercase">
              Colonia de Verano
            </span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <h1 className="fw-bold mb-0">
                {loading ? "..." : stats.campRegistrations}
              </h1>
              <span className="text-muted small">inscriptos</span>
            </div>
            <span className="text-warning text-dark small fw-bold mt-1">
              Turnos Mañana y Tarde
            </span>
            <div className="mt-3">
              <Link
                to="/admin/colonia"
                className="btn btn-sm btn-outline-dark fw-bold"
              >
                Ver inscriptos →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 bg-white">
        <h5 className="fw-bold mb-3">Acciones Rápidas</h5>
        <div className="d-flex flex-wrap gap-2">
          <Link
            to="/admin/socios"
            className="btn btn-dark fw-bold btn-socio btn-sm px-3"
          >
            + Alta Nuevo Socio
          </Link>
          <Link
            to="/admin/canchas"
            className="btn btn-outline-dark fw-bold btn-sm px-3"
          >
            + Tomar Turno Cancha
          </Link>
          <Link
            to="/"
            target="_blank"
            className="btn btn-outline-secondary fw-bold btn-sm px-3"
          >
            Ver Web Pública ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
