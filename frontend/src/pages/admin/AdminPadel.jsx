import { useState, useEffect } from "react";
import {
  getPadelCourts,
  getPadelReservations,
  createPadelReservation,
  updatePadelReservationStatus,
} from "../../service/padel.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminPadel() {
  const { addToast } = useToast();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [courts, setCourts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: null, success: null });

  const [form, setForm] = useState({
    facility_id: "",
    client_name: "",
    client_phone: "",
    reservation_date: today,
    start_time: "18:00",
    end_time: "19:30",
    final_price: 12000,
    payment_method: "pendiente",
    notes: "",
  });

  async function loadCourts() {
    try {
      const data = await getPadelCourts();
      setCourts(data);
      if (data.length > 0) {
        setForm((prev) => ({
          ...prev,
          facility_id: data[0].idfacilities,
          final_price: Number(data[0].default_price) || 12000,
        }));
      }
    } catch {
      setFeedback({ error: "Error al cargar canchas de pádel", success: null });
    }
  }

  async function loadReservations(date) {
    try {
      setLoading(true);
      const data = await getPadelReservations(date);
      setReservations(data);
    } catch {
      setFeedback({ error: "Error al cargar turnos de pádel", success: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourts();
  }, []);

  useEffect(() => {
    loadReservations(selectedDate);
  }, [selectedDate]);

  const handleCourtChange = (facilityId) => {
    const selected = courts.find((c) => c.idfacilities === Number(facilityId));
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
      await createPadelReservation({
        ...form,
        facility_id: Number(form.facility_id),
        final_price: Number(form.final_price),
      });

      setFeedback({
        success: "Turno de pádel reservado con éxito",
        error: null,
      });
      loadReservations(selectedDate);

      setForm((prev) => ({
        ...prev,
        client_name: "",
        client_phone: "",
        notes: "",
      }));
      addToast("Turno registrado con éxito", "success");
    } catch (err) {
      addToast("Error al registrar el turno.", "error");
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePadelReservationStatus(id, status);
      loadReservations(selectedDate);
      addToast("Turno actualizado con éxito", "success");
    } catch {
      addToast("Error al actualizar el turno.", "error");
    }
  };

  const quickTimeSlots = [
    { start: "14:00", end: "15:30" },
    { start: "15:30", end: "17:00" },
    { start: "17:00", end: "18:30" },
    { start: "18:30", end: "20:00" },
    { start: "20:00", end: "21:30" },
    { start: "21:30", end: "23:00" },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Subcomisión de Pádel</h2>
          <span className="text-muted small">
            Turnero rotativo y control de pista
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="fw-bold small mb-0">Fecha:</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setForm((prev) => ({
                ...prev,
                reservation_date: e.target.value,
              }));
            }}
          />
        </div>
      </div>

      {feedback.error && (
        <div className="alert alert-danger py-2">{feedback.error}</div>
      )}
      {feedback.success && (
        <div className="alert alert-success py-2">{feedback.success}</div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3">Nuevo Turno</h5>

            <label className="form-label small fw-bold text-muted mb-1">
              Bloques Frecuentes (90 min)
            </label>
            <div className="d-flex flex-wrap gap-1 mb-3">
              {quickTimeSlots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  className={`btn btn-sm ${
                    form.start_time === slot.start && form.end_time === slot.end
                      ? "btn-dark"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      start_time: slot.start,
                      end_time: slot.end,
                    }))
                  }
                >
                  {slot.start}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateReservation}>
              <div className="mb-2">
                <label className="form-label small fw-bold">Cancha</label>
                <select
                  className="form-select"
                  value={form.facility_id}
                  onChange={(e) => handleCourtChange(e.target.value)}
                >
                  {courts.map((c) => (
                    <option key={c.idfacilities} value={c.idfacilities}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Desde</label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm({ ...form, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Hasta</label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm({ ...form, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Jugador / Contacto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre y apellido"
                  className="form-control"
                  value={form.client_name}
                  onChange={(e) =>
                    setForm({ ...form, client_name: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Teléfono (WhatsApp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 3435123456"
                  className="form-control"
                  value={form.client_phone}
                  onChange={(e) =>
                    setForm({ ...form, client_phone: e.target.value })
                  }
                />
              </div>

              <div className="row mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Precio ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.final_price}
                    onChange={(e) =>
                      setForm({ ...form, final_price: e.target.value })
                    }
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    Estado Pago
                  </label>
                  <select
                    className="form-select"
                    value={form.payment_method}
                    onChange={(e) =>
                      setForm({ ...form, payment_method: e.target.value })
                    }
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Notas (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Seña, paletas alquiladas, etc."
                  className="form-control"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-dark w-100 py-2">
                Agendar Turno
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3">Grilla de Turnos ({selectedDate})</h5>

            {loading ? (
              <LoadingSpinner message="Cargando turnos..." />
            ) : reservations.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">
                  No hay turnos registrados para esta fecha.
                </p>
                <small>
                  Utilizá el formulario lateral o los bloques rápidos para
                  agendar uno.
                </small>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Horario</th>
                      <th>Cancha</th>
                      <th>Jugador</th>
                      <th>Pago</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.idreservations}>
                        <td className="fw-bold">{`${r.start_time} - ${r.end_time}`}</td>
                        <td>{r.court_name}</td>
                        <td>
                          <div className="fw-semibold">{r.client_name}</div>
                          <small className="text-muted">{r.client_phone}</small>
                          {r.notes && (
                            <div className="text-muted small italic">
                              Nota: {r.notes}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              r.payment_method === "pendiente"
                                ? "bg-warning text-dark"
                                : "bg-info text-dark"
                            }`}
                          >
                            {r.payment_method} (${r.final_price})
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              r.status === "confirmada"
                                ? "bg-success"
                                : r.status === "cancelada"
                                  ? "bg-danger"
                                  : "bg-primary"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {r.status === "confirmada" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success me-1"
                                onClick={() =>
                                  handleStatusChange(
                                    r.idreservations,
                                    "completada",
                                  )
                                }
                                title="Marcar como jugado"
                              >
                                Completar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleStatusChange(
                                    r.idreservations,
                                    "cancelada",
                                  )
                                }
                                title="Liberar horario"
                              >
                                Cancelar
                              </button>
                            </>
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
