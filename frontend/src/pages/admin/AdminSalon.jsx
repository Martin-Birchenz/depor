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
        error: "Error al cargar instalaciones de salón",
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
        error: "Error al cargar reservas de salón",
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
      addToast("Evento agendado con éxito", "success");
    } catch (err) {
      addToast("Error al agendar el evento.", "error");
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateSalonReservationStatus(id, status);
      loadReservations(currentMonth, currentYear);
      addToast("Evento actualizado con éxito", "success");
    } catch {
      addToast("Error al actualizar el evento.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Subcomisión de Salón y Quinchos</h2>
          <span className="text-muted small">
            Gestión de alquileres por jornada y eventos sociales
          </span>
        </div>

        <div className="d-flex gap-2">
          <select
            className="form-select w-auto"
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
            className="form-control w-auto"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
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
            <h5 className="fw-bold mb-3">Reservar Salón / Parrilla</h5>
            <form onSubmit={handleCreateReservation}>
              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Instalación / Sector
                </label>
                <select
                  className="form-select"
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
                  Fecha del Evento
                </label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={form.reservation_date}
                  onChange={(e) =>
                    setForm({ ...form, reservation_date: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Jornada / Franja
                </label>
                <select
                  className="form-select"
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
                  Responsable / Contratante
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.client_name}
                  onChange={(e) =>
                    setForm({ ...form, client_name: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.client_phone}
                  onChange={(e) =>
                    setForm({ ...form, client_phone: e.target.value })
                  }
                />
              </div>

              <div className="row mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    Precio Total ($)
                  </label>
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
                    <option value="pendiente">Seña / Pendiente</option>
                    <option value="efectivo">Efectivo Total</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Detalles / Vajilla / Seña
                </label>
                <textarea
                  rows="2"
                  placeholder="Ej: Seña $10.000 abonada. Uso de freidora."
                  className="form-control"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-dark w-100 py-2">
                Confirmar Alquiler
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3">Agenda de Eventos Programados</h5>

            {loading ? (
              <LoadingSpinner message="Cargando eventos..." />
            ) : reservations.length === 0 ? (
              <p className="text-muted text-center py-4">
                No hay eventos agendados para este mes.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Sector</th>
                      <th>Responsable</th>
                      <th>Monto / Pago</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.idreservations}>
                        <td className="fw-bold">
                          {r.reservation_date}
                          <div className="small text-muted">
                            {r.start_time} - {r.end_time}
                          </div>
                        </td>
                        <td>{r.facility_name}</td>
                        <td>
                          <div>{r.client_name}</div>
                          <small className="text-muted">{r.client_phone}</small>
                          {r.notes && (
                            <div className="text-muted small">{r.notes}</div>
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
                              >
                                Finalizar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleStatusChange(
                                    r.idreservations,
                                    "cancelada",
                                  )
                                }
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
