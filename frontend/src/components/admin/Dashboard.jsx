import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getDashboardMetrics } from "../../service/dashboard.service";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useToast } from "../../hooks/useToast";

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardMetrics();
      setData(res);
    } catch (error) {
      console.error("Error al cargar métricas:", error);
      addToast("No se pudieron cargar las estadísticas del club", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingSpinner message="Consolidando métricas del club..." />;
  }

  const { members, camp, canteen, apparel } = data || {
    members: { totals: {}, recent: [] },
    camp: { totals: {}, recent: [] },
    canteen: { session: {}, topProducts: [] },
    apparel: {},
  };

  const memTotals = members?.totals || {};
  const campTotals = camp?.totals || {};
  const cantSession = canteen?.session || {};

  const activePercent =
    memTotals.total > 0
      ? Math.round((memTotals.active_count / memTotals.total) * 100)
      : 0;

  return (
    <div className="pb-5">
      <div className="bg-white p-3 p-md-4 rounded-3 shadow-sm border mb-3 mb-md-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div>
          <span className="badge bg-dark text-uppercase px-2 py-1 mb-2">
            Administración General
          </span>
          <h2 className="fw-bold mb-1 tracking-tight">
            Centro de Control Operativo
          </h2>
        </div>
        <button
          className="btn btn-dark fw-bold px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
          onClick={loadData}
        >
          Actualizar Datos
        </button>
      </div>

      <div
        className="card shadow-sm border mb-4 bg-white rounded-3 overflow-hidden"
        style={{ borderTop: "5px solid #0d6efd" }}
      >
        <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold mb-0 text-dark">Padrón de Socios</h5>
          </div>
          <Link
            to="/admin/socios"
            className="btn btn-sm btn-outline-primary fw-semibold"
          >
            Ir al Padrón →
          </Link>
        </div>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-3 bg-light border text-center">
                <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                  Total Padrón
                </span>
                <h3 className="fw-bold mb-0">{memTotals.total || 0}</h3>
                <span className="text-muted small">Socios registrados</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-3 bg-light border border-success text-center">
                <span className="text-success small fw-bold text-uppercase d-block mb-1">
                  Al Día (Activos)
                </span>
                <h3 className="fw-bold text-success mb-0">
                  {memTotals.active_count || 0}
                </h3>
                <span className="text-muted small">
                  {activePercent}% de la base
                </span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-3 bg-light border border-danger text-center">
                <span className="text-danger small fw-bold text-uppercase d-block mb-1">
                  Deudores
                </span>
                <h3 className="fw-bold text-danger mb-0">
                  {memTotals.debtor_count || 0}
                </h3>
                <span className="text-muted small">Cuota pendiente</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-3 bg-light border text-center">
                <span className="text-secondary small fw-bold text-uppercase d-block mb-1">
                  Bajas
                </span>
                <h3 className="fw-bold text-secondary mb-0">
                  {memTotals.inactive_count || 0}
                </h3>
                <span className="text-muted small">Inactivos</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-3 bg-light border mb-4">
            <div className="d-flex justify-content-between small fw-bold mb-2">
              <span>Relación Cobranza:</span>
              <span className="text-success">
                {activePercent}% de cuotas regulares
              </span>
            </div>
            <div className="progress" style={{ height: "12px" }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${activePercent}%` }}
              ></div>
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{
                  width: `${
                    memTotals.total > 0
                      ? (memTotals.debtor_count / memTotals.total) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <h6 className="fw-bold text-uppercase small text-muted mb-2 tracking-wide">
            Últimas 5 altas de socios
          </h6>
          <div className="table-responsive rounded-3 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">Nombre y Apellido</th>
                  <th>DNI</th>
                  <th>Contacto</th>
                  <th className="text-end pe-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {members.recent?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      No hay registros recientes.
                    </td>
                  </tr>
                ) : (
                  members.recent.map((m) => (
                    <tr key={m.idmembers}>
                      <td className="ps-3 fw-bold text-dark">
                        {m.first_name} {m.last_name}
                      </td>
                      <td>{m.dni}</td>
                      <td className="small text-muted">{m.phone || "-"}</td>
                      <td className="text-end pe-3">
                        <span
                          className={`badge ${
                            m.status === "active"
                              ? "bg-success"
                              : m.status === "debtor"
                                ? "bg-danger"
                                : "bg-secondary"
                          }`}
                        >
                          {m.status === "active"
                            ? "Al Día"
                            : m.status === "debtor"
                              ? "Deudor"
                              : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className="card shadow-sm border mb-4 bg-white rounded-3 overflow-hidden"
        style={{ borderTop: "5px solid #0dcaf0" }}
      >
        <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold mb-0 text-dark">Colonia y Pileta</h5>
          </div>
          <Link
            to="/admin/colonia"
            className="btn btn-sm btn-outline-info fw-semibold text-dark"
          >
            Ver Colonia →
          </Link>
        </div>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="p-2 p-md-3 rounded-3 bg-light border text-center">
                <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                  Total Preinscriptos
                </span>
                <h3 className="fw-bold mb-0 fs-4 fs-md-3">
                  {campTotals.total || 0}
                </h3>
                <span className="text-muted small">
                  {campTotals.members_in_camp || 0} socios de club
                </span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-2 p-md-3 rounded-3 bg-light border border-success text-center">
                <span className="text-success small fw-bold text-uppercase d-block mb-1">
                  Confirmados (Apto OK)
                </span>
                <h3 className="fw-bold text-success mb-0">
                  {campTotals.confirmed_count || 0}
                </h3>
                <span className="text-muted small">Ficha entregada</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-2 p-md-3 rounded-3 bg-light border border-warning text-center">
                <span className="text-warning text-dark small fw-bold text-uppercase d-block mb-1">
                  Pendientes
                </span>
                <h3 className="fw-bold text-warning text-dark mb-0">
                  {campTotals.pending_count || 0}
                </h3>
                <span className="text-muted small">Falta médica o pago</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-2 p-md-3 rounded-3 bg-light border text-center">
                <span className="text-primary small fw-bold text-uppercase d-block mb-1">
                  Distribución de Cupo
                </span>
                <div className="d-flex justify-content-around mt-2">
                  <span className="badge bg-primary">
                    Mañana: {campTotals.morning_shift || 0}
                  </span>
                  <span className="badge bg-warning text-dark">
                    Tarde: {campTotals.afternoon_shift || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h6 className="fw-bold text-uppercase small text-muted mb-2 tracking-wide">
            Últimas solicitudes recibidas
          </h6>
          <div className="table-responsive rounded-3 border">
            <table
              className="table table-hover align-middle mb-0"
              style={{ minWidth: "480px" }}
            >
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">Alumno / Menor</th>
                  <th>Tutor Responsable</th>
                  <th>Teléfono</th>
                  <th>Turno</th>
                  <th className="text-end pe-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {camp.recent?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-3 text-muted">
                      No hay inscripciones cargadas.
                    </td>
                  </tr>
                ) : (
                  camp.recent.map((c) => (
                    <tr key={c.idcamp_registrations}>
                      <td className="ps-3 fw-bold text-dark">
                        {c.minor_full_name}
                      </td>
                      <td>{c.guardian_name}</td>
                      <td className="small text-muted">{c.guardian_phone}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {c.shift ? c.shift.toUpperCase() : "MAÑANA"}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <span
                          className={`badge ${
                            c.status === "confirmado"
                              ? "bg-success"
                              : c.status === "baja"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {c.status || "pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div
            className="card shadow-sm border h-100 bg-white rounded-3 overflow-hidden"
            style={{ borderTop: "5px solid #fd7e14" }}
          >
            <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0 text-dark">Cantina</h5>
              </div>
              <Link
                to="/admin/cantina"
                className="btn btn-sm btn-outline-warning fw-semibold text-dark"
              >
                Abrir Mostrador →
              </Link>
            </div>
            <div className="card-body p-3 p-md-4">
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 bg-light border text-center">
                    <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                      Recaudación Turno
                    </span>
                    <h3 className="fw-bold text-success mb-0">
                      $
                      {Number(cantSession.total_amount || 0).toLocaleString(
                        "es-AR",
                      )}
                    </h3>
                    <span className="small text-muted">
                      {cantSession.tickets_count || 0} comandas cobradas
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 bg-light border small">
                    <span className="text-muted fw-bold text-uppercase d-block mb-2">
                      Desglose de Ingresos:
                    </span>
                    <div className="d-flex justify-content-between mb-1">
                      <span> Efectivo:</span>
                      <strong className="text-dark">
                        $
                        {Number(cantSession.efectivo || 0).toLocaleString(
                          "es-AR",
                        )}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span> Transferencia:</span>
                      <strong className="text-dark">
                        $
                        {Number(cantSession.transferencia || 0).toLocaleString(
                          "es-AR",
                        )}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Débito:</span>
                      <strong className="text-dark">
                        $
                        {Number(cantSession.debito || 0).toLocaleString(
                          "es-AR",
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-uppercase small text-muted mb-2 tracking-wide">
                Productos más solicitados en la jornada
              </h6>
              <div className="table-responsive rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-3">Insumo</th>
                      <th className="text-center">Unidades</th>
                      <th className="text-end pe-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canteen.topProducts?.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center py-3 text-muted small"
                        >
                          Sin ventas registradas en la jornada actual.
                        </td>
                      </tr>
                    ) : (
                      canteen.topProducts.map((p, idx) => (
                        <tr key={idx}>
                          <td className="ps-3 fw-semibold text-dark">
                            {p.name}
                          </td>
                          <td className="text-center fw-bold">
                            {p.total_qty} u.
                          </td>
                          <td className="text-end pe-3 fw-bold text-dark">
                            ${Number(p.total_sales).toLocaleString("es-AR")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div
            className="card shadow-sm border h-100 bg-white rounded-3 overflow-hidden"
            style={{ borderTop: "5px solid #212529" }}
          >
            <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0 text-dark">Tienda y Stock</h5>
              </div>
              <Link
                to="/admin/indumentaria"
                className="btn btn-sm btn-outline-dark fw-semibold"
              >
                Ver Catálogo →
              </Link>
            </div>
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border text-center">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                        Modelos
                      </span>
                      <h3 className="fw-bold mb-0">
                        {apparel.total_products || 0}
                      </h3>
                      <span className="small text-muted">Diseños activos</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border text-center">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                        Prendas
                      </span>
                      <h3 className="fw-bold mb-0">
                        {apparel.total_units || 0}
                      </h3>
                      <span className="small text-muted">Stock global</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-light border mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-bold text-dark d-block">
                        Control de Stock Crítico
                      </span>
                      <span className="text-muted small">
                        Variantes con 3 prendas o menos
                      </span>
                    </div>
                    <span
                      className={`badge fs-6 ${
                        apparel.low_stock_variants > 0
                          ? "bg-danger"
                          : "bg-success"
                      }`}
                    >
                      {apparel.low_stock_variants || 0}{" "}
                      {apparel.low_stock_variants === 1
                        ? "producto"
                        : "productos"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-top text-center">
                <Link
                  to="/admin/indumentaria"
                  className="btn btn-dark w-100 fw-bold py-2 shadow-sm"
                >
                  Gestionar Inventario y Precios
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
