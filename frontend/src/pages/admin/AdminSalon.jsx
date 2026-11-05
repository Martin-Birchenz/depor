import { useState, useEffect } from "react";
import {
  getSalonFacilities,
  getSalonReservations,
  createSalonReservation,
  updateSalonReservationStatus,
} from "../../service/salon.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminSalon() {
  const { addToast } = useToast();
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const [facilities, setFacilities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: null, success: null });

  const [form, setForm] = useState({
    facility_id: "",
    client_name: "",
    client_phone: "",
    reservation_date: new Date().toISOString().split("T")[0],
    shift: "noche",
    final_price: 45000,
    payment_method: "pendiente",
    notes: "",
  });

  // Formateadores visuales
  const formatDateAR = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
  };

  const formatShiftLabel = (shift, startTime, endTime) => {
    if (shift === "noche") return "Noche (19:00 a 05:00 hs)";
    if (shift === "mediodia") return "Mediodía (11:00 a 17:00 hs)";
    if (shift === "completo") return "Jornada Completa";
    if (startTime && endTime) {
      const s = startTime.substring(0, 5);
      const e =
        endTime.substring(0, 5) === "00:00" ? "00:00" : endTime.substring(0, 5);
      return `${s} a ${e} hs`;
    }
    return shift || "Turno asignado";
  };

  async function loadFacilities() {
    try {
      const data = await getSalonFacilities();
      setFacilities(data);
      if (data.length > 0) {
        setForm((prev) => ({
          ...prev,
          facility_id: data[0].idfacilities,
          final_price: Number(data[0].default_price) || 45000,
        }));
      }
    } catch {
      setFeedback({
        error: "Error al cargar las instalaciones de Salón y Parrillas",
        success: null,
      });
    }
  }

  async function loadReservations(month, year) {
    try {
      setLoading(true);
      const data = await getSalonReservations(month, year);
      setReservations(data);
    } catch {
      setFeedback({
        error: "Error al cargar el cronograma de alquileres",
        success: null,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    loadReservations(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const handleFacilityChange = (facilityId) => {
    const selected = facilities.find(
      (f) => f.idfacilities === Number(facilityId),
    );
    setForm((prev) => ({
      ...prev,
      facility_id: facilityId,
      final_price: selected ? Number(selected.default_price) : prev.final_price,
    }));
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setFeedback({ error: null, success: null });

    try {
      await createSalonReservation({
        ...form,
        facility_id: Number(form.facility_id),
        final_price: Number(form.final_price),
      });

      loadReservations(currentMonth, currentYear);

      setForm((prev) => ({
        ...prev,
        client_name: "",
        client_phone: "",
        notes: "",
      }));
      addToast("Alquiler agendado con éxito", "success");
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "El sector ya cuenta con un evento agendado para esa fecha y franja horaria.";
      setFeedback({ error: errMsg, success: null });
      addToast(errMsg, "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateSalonReservationStatus(id, status);
      loadReservations(currentMonth, currentYear);
      addToast("Estado de reserva actualizado", "success");
    } catch {
      addToast("Error al actualizar la reserva.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Alquiler de Salón y Sector Parrillas</h2>
          <span className="text-muted small">
            Control de reservas por turnos, celebraciones y eventos sociales
          </span>
        </div>

        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm w-auto"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
          >
            {[
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ].map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="form-control form-control-sm w-auto"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
          />
        </div>
      </div>

      {feedback.error && (
        <div
          className="alert alert-danger alert-dismissible fade show py-2 small"
          role="alert"
        >
          <strong>Atención:</strong> {feedback.error}
          <button
            type="button"
            className="btn-close py-2"
            onClick={() => setFeedback({ ...feedback, error: null })}
          ></button>
        </div>
      )}
      {feedback.success && (
        <div
          className="alert alert-success alert-dismissible fade show py-2 small"
          role="alert"
        >
          {feedback.success}
          <button
            type="button"
            className="btn-close py-2"
            onClick={() => setFeedback({ ...feedback, success: null })}
          ></button>
        </div>
      )}

      <div className="row g-4">
        {/* Formulario de Reserva */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-3 bg-white">
            <h5 className="fw-bold mb-3">Registrar Nuevo Alquiler</h5>
            <form onSubmit={handleCreateReservation}>
              <div className="mb-2">
                <label className="form-label small fw-bold">Sector *</label>
                <select
                  className="form-select form-select-sm"
                  value={form.facility_id}
                  onChange={(e) => handleFacilityChange(e.target.value)}
                >
                  {facilities.map((f) => (
                    <option key={f.idfacilities} value={f.idfacilities}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Fecha del Evento *
                </label>
                <input
                  type="date"
                  required
                  className="form-control form-control-sm"
                  value={form.reservation_date}
                  onChange={(e) =>
                    setForm({ ...form, reservation_date: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Franja Horaria *
                </label>
                <select
                  className="form-select form-select-sm"
                  value={form.shift}
                  onChange={(e) => setForm({ ...form, shift: e.target.value })}
                >
                  <option value="noche">Noche (19:00 a 05:00)</option>
                  <option value="mediodia">Mediodía (11:00 a 17:00)</option>
                  <option value="completo">Jornada Completa</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Responsable / Contratante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellido"
                  className="form-control form-control-sm"
                  value={form.client_name}
                  onChange={(e) =>
                    setForm({ ...form, client_name: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Teléfono de Contacto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 3435123456"
                  className="form-control form-control-sm"
                  value={form.client_phone}
                  onChange={(e) =>
                    setForm({ ...form, client_phone: e.target.value })
                  }
                />
              </div>

              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    Precio Total ($)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={form.final_price}
                    onChange={(e) =>
                      setForm({ ...form, final_price: e.target.value })
                    }
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    Estado del Pago
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={form.payment_method}
                    onChange={(e) =>
                      setForm({ ...form, payment_method: e.target.value })
                    }
                  >
                    <option value="pendiente">Seña / Pendiente</option>
                    <option value="efectivo">Efectivo Total</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Notas / Vajilla / Seña
                </label>
                <textarea
                  rows="2"
                  placeholder="Ej: Dejó $15.000 de seña. Incluye limpieza."
                  className="form-control form-control-sm"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 py-2 fw-bold btn-sm"
              >
                Confirmar Alquiler
              </button>
            </form>
          </div>
        </div>

        {/* Tabla de Eventos */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-3 bg-white">
            <h5 className="fw-bold mb-3">Agenda de Eventos Programados</h5>

            {loading ? (
              <LoadingSpinner message="Cargando agenda..." />
            ) : reservations.length === 0 ? (
              <p className="text-muted text-center py-4">
                No hay alquileres agendados para este período.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Fecha</th>
                      <th>Sector</th>
                      <th>Responsable</th>
                      <th>Monto Total</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.idreservations}>
                        <td>
                          <div className="fw-bold text-dark">
                            {formatDateAR(r.reservation_date)}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            {formatShiftLabel(
                              r.shift,
                              r.start_time,
                              r.end_time,
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {r.facility_name || r.court_name || "Sector"}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">
                            {r.client_name}
                          </div>
                          <small className="text-muted">{r.client_phone}</small>
                          {r.notes && (
                            <div className="text-muted small fst-italic">
                              {r.notes}
                            </div>
                          )}
                        </td>
                        <td className="small">
                          <div className="fw-bold">
                            {formatCurrency(r.final_price)}
                          </div>
                          <span
                            className={`badge ${
                              r.payment_method === "pendiente"
                                ? "bg-warning text-dark"
                                : "bg-info text-dark"
                            }`}
                            style={{ fontSize: "10px" }}
                          >
                            {r.payment_method}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              r.status === "confirmada"
                                ? "bg-success"
                                : r.status === "cancelada"
                                  ? "bg-danger"
                                  : "bg-secondary"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {r.status === "confirmada" && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() =>
                                  handleStatusChange(
                                    r.idreservations,
                                    "completada",
                                  )
                                }
                              >
                                Finalizar
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() =>
                                  handleStatusChange(
                                    r.idreservations,
                                    "cancelada",
                                  )
                                }
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
