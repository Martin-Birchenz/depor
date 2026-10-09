import { useEffect, useState } from "react";
import {
  getFacilities,
  getBookings,
  createBookingAdmin,
  updateBookingStatus,
} from "../../service/court.service";

export default function AdminCanchas() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedFacility, setSelectedFacility] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [newBooking, setNewBooking] = useState({
    facilityId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    durationMinutes: 60,
    clientName: "",
    clientPhone: "",
    isMember: false,
    depositPaid: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [facData, bookData] = await Promise.all([
          getFacilities(),
          getBookings({ date: selectedDate }),
        ]);

        if (isMounted) {
          setFacilities(facData || []);
          setBookings(bookData || []);
          if (facData && facData.length > 0 && !newBooking.facilityId) {
            setNewBooking((prev) => ({
              ...prev,
              facilityId: facData[0].id || facData[0].idfacilities,
            }));
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error al cargar datos del turnero:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const refreshData = async () => {
    try {
      const [facData, bookData] = await Promise.all([
        getFacilities(),
        getBookings({ date: selectedDate }),
      ]);
      setFacilities(facData || []);
      setBookings(bookData || []);
    } catch (error) {
      console.error("Error al refrescar turnero:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) =>
          b.idbookings === id || b.id === id ? { ...b, status: newStatus } : b,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado del turno.");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      await createBookingAdmin({
        ...newBooking,
        facilityId: Number(newBooking.facilityId),
        depositPaid: Number(newBooking.depositPaid),
      });
      setShowModal(false);
      setNewBooking({
        facilityId: facilities[0]?.id || facilities[0]?.idfacilities || "",
        date: selectedDate,
        startTime: "18:00",
        durationMinutes: 60,
        clientName: "",
        clientPhone: "",
        isMember: false,
        depositPaid: 0,
      });
      refreshData();
    } catch (error) {
      setFeedbackMsg(
        error.response?.data?.message || "Error al guardar la reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const facId = String(b.facility_id || b.facilityId);
    const matchesFacility =
      selectedFacility === "todas" || facId === String(selectedFacility);
    const matchesStatus =
      statusFilter === "todos" ||
      (b.status || "").toLowerCase() === statusFilter;
    return matchesFacility && matchesStatus;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Turnero de Canchas</h2>
          <p className="text-muted small mb-0">
            Control diario de ocupación, reservas de socios y alquiler de
            canchas.
          </p>
        </div>
        <button
          className="btn btn-dark fw-bold btn-socio px-4 py-2"
          onClick={() => setShowModal(true)}
        >
          + Nueva Reserva Manual
        </button>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-muted mb-1">
              Fecha
            </label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-muted mb-1">
              Instalación
            </label>
            <select
              className="form-select"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
            >
              <option value="todas">Todas las canchas</option>
              {facilities.map((f) => {
                const fId = f.id || f.idfacilities;
                return (
                  <option key={fId} value={fId}>
                    {f.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-muted mb-1">
              Estado
            </label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmado">Confirmados</option>
              <option value="pendiente">Pendientes</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="ps-4">Horario</th>
                <th>Cancha / Espacio</th>
                <th>Titular</th>
                <th>Contacto</th>
                <th>Condición</th>
                <th>Seña / Pago</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div
                      className="spinner-border text-dark"
                      role="status"
                    ></div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No hay turnos registrados para esta fecha y filtros
                    seleccionados.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const id = b.idbookings || b.id;
                  const facilityName =
                    b.facility_name ||
                    facilities.find(
                      (f) =>
                        String(f.id || f.idfacilities) ===
                        String(b.facility_id || b.facilityId),
                    )?.name ||
                    "Cancha";
                  const time = b.start_time || b.startTime || "--:--";
                  const client = b.client_name || b.clientName || "Sin asignar";
                  const phone = b.client_phone || b.clientPhone || "-";
                  const isMember = b.is_member ?? b.isMember;
                  const deposit = Number(b.deposit_paid ?? b.depositPaid ?? 0);
                  const status = (b.status || "pendiente").toLowerCase();

                  return (
                    <tr key={id}>
                      <td className="ps-4 fw-bold text-dark">{time} hs</td>
                      <td className="fw-semibold text-secondary">
                        {facilityName}
                      </td>
                      <td className="fw-bold">{client}</td>
                      <td className="small text-muted">{phone}</td>
                      <td>
                        <span
                          className={`badge ${
                            isMember
                              ? "bg-dark text-white"
                              : "bg-light text-dark border"
                          }`}
                        >
                          {isMember ? "Socio" : "No Socio"}
                        </span>
                      </td>
                      <td>
                        {deposit > 0 ? (
                          <span className="badge bg-success">
                            Seña: ${deposit.toLocaleString("es-AR")}
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border">
                            Sin seña
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            status === "confirmado"
                              ? "bg-success"
                              : status === "pendiente"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(id, e.target.value)
                          }
                        >
                          <option value="confirmado">Confirmado</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">Tomar Turno Manual</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleModalSubmit}>
                <div className="modal-body p-4">
                  {feedbackMsg && (
                    <div className="alert alert-danger small py-2">
                      {feedbackMsg}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Instalación *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={newBooking.facilityId}
                        onChange={(e) =>
                          setNewBooking({
                            ...newBooking,
                            facilityId: e.target.value,
                          })
                        }
                      >
                        {facilities.map((f) => {
                          const fId = f.id || f.idfacilities;
                          return (
                            <option key={fId} value={fId}>
                              {f.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={newBooking.date}
                        onChange={(e) =>
                          setNewBooking({ ...newBooking, date: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Hora Inicio *
                      </label>
                      <input
                        type="time"
                        required
                        className="form-control form-control-sm"
                        value={newBooking.startTime}
                        onChange={(e) =>
                          setNewBooking({
                            ...newBooking,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Nombre Titular *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        placeholder="Ej: Marcos Rossi"
                        value={newBooking.clientName}
                        onChange={(e) =>
                          setNewBooking({
                            ...newBooking,
                            clientName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Teléfono *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        placeholder="3435..."
                        value={newBooking.clientPhone}
                        onChange={(e) =>
                          setNewBooking({
                            ...newBooking,
                            clientPhone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Monto Seña ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm"
                        value={newBooking.depositPaid}
                        onChange={(e) =>
                          setNewBooking({
                            ...newBooking,
                            depositPaid: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6 d-flex align-items-end">
                      <div className="form-check pb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isMemberCheck"
                          checked={newBooking.isMember}
                          onChange={(e) =>
                            setNewBooking({
                              ...newBooking,
                              isMember: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label small fw-bold ms-1"
                          htmlFor="isMemberCheck"
                        >
                          ¿Es socio del club?
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-sm btn-dark px-3 fw-bold"
                  >
                    {submitting ? "Agendando..." : "Confirmar Reserva"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
