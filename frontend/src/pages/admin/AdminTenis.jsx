import { useState, useEffect, useCallback } from "react";
import {
  getTennisCourts,
  getTennisReservations,
  createTennisReservation,
  updateReservationStatus,
  getTennisGroups,
  createTennisGroup,
  getGroupStudents,
  addTennisStudent,
  updateStudentStatus,
} from "../../service/tennis.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminTenis() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("turnos");
  const [courts, setCourts] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [reservations, setReservations] = useState([]);
  const [resForm, setResForm] = useState({
    facility_id: "",
    client_name: "",
    client_phone: "",
    reservation_date: today,
    start_time: "14:00",
    end_time: "15:00",
    final_price: 10000,
    payment_method: "pendiente",
    reservation_type: "casual",
    notes: "",
  });

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [groupForm, setGroupForm] = useState({
    facility_id: "",
    name: "",
    day_of_week: "lunes",
    start_time: "17:00",
    end_time: "18:00",
    coach_name: "",
    monthly_fee: 15000,
  });
  const [studentForm, setStudentForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    status: "al_dia",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: null, success: null });

  const loadCourts = useCallback(async () => {
    try {
      const data = await getTennisCourts();
      setCourts(data);
      if (data.length > 0) {
        setResForm((prev) => ({ ...prev, facility_id: data[0].idfacilities }));
        setGroupForm((prev) => ({
          ...prev,
          facility_id: data[0].idfacilities,
        }));
      }
    } catch {
      setFeedback({ error: "Error al cargar canchas de tenis", success: null });
    }
  }, []);

  const loadReservations = useCallback(async (date) => {
    try {
      setLoading(true);
      const data = await getTennisReservations(date);
      setReservations(data);
    } catch {
      setFeedback({ error: "Error al cargar turnos", success: null });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async (groupId) => {
    try {
      const data = await getGroupStudents(groupId);
      setStudents(data);
    } catch {
      setFeedback({ error: "Error al cargar alumnos", success: null });
    }
  }, []);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTennisGroups();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup((prev) => {
          const current = prev
            ? data.find((g) => g.id === prev.id) || data[0]
            : data[0];
          loadStudents(current.id);
          return current;
        });
      }
    } catch {
      setFeedback({ error: "Error al cargar grupos", success: null });
    } finally {
      setLoading(false);
    }
  }, [loadStudents]);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  useEffect(() => {
    if (activeTab === "turnos") {
      loadReservations(selectedDate);
    } else {
      loadGroups();
    }
  }, [activeTab, selectedDate, loadReservations, loadGroups]);

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setFeedback({ error: null, success: null });
    try {
      await createTennisReservation({
        ...resForm,
        facility_id: Number(resForm.facility_id),
        final_price: Number(resForm.final_price),
      });

      loadReservations(selectedDate);
      setResForm((prev) => ({
        ...prev,
        client_name: "",
        client_phone: "",
        notes: "",
      }));
      addToast("Turno reservado con éxito", "success");
    } catch (err) {
      addToast("Error al reservar el turno.", "error");
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      loadReservations(selectedDate);
      addToast("Turno actualizado con éxito", "success");
    } catch {
      addToast("Error al actualizar el turno.", "error");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await createTennisGroup({
        ...groupForm,
        facility_id: Number(groupForm.facility_id),
        monthly_fee: Number(groupForm.monthly_fee),
      });

      loadGroups();
      addToast("Grupo creado con éxito", "success");
    } catch (err) {
      addToast("Error al crear grupo.", "error");
      console.error(err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    try {
      await addTennisStudent({
        ...studentForm,
        group_id: selectedGroup.id,
      });

      loadStudents(selectedGroup.id);
      setStudentForm({ full_name: "", phone: "", email: "", status: "al_dia" });
      addToast("Alumno inscripto con éxito", "success");
    } catch (err) {
      addToast("Error al inscribir alumno.", "error");
      console.error(err);
    }
  };

  const handleStudentStatus = async (studentId, status) => {
    try {
      await updateStudentStatus(studentId, status);
      loadStudents(selectedGroup.id);
      addToast("Estado actualizado con éxito", "success");
    } catch {
      addToast("Error al actualizar el estado del alumno.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Subcomisión de Tenis</h2>
          <span className="text-muted small">
            Gestión integral de canchas, turnos y escuelita
          </span>
        </div>

        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "turnos" ? "active btn-dark" : "text-dark"}`}
              onClick={() => setActiveTab("turnos")}
            >
              Turnero de Canchas
            </button>
          </li>
          <li className="nav-item ms-2">
            <button
              className={`nav-link ${activeTab === "escuelita" ? "active btn-dark" : "text-dark"}`}
              onClick={() => setActiveTab("escuelita")}
            >
              Escuelita y Alumnos
            </button>
          </li>
        </ul>
      </div>

      {feedback.error && (
        <div className="alert alert-danger py-2">{feedback.error}</div>
      )}
      {feedback.success && (
        <div className="alert alert-success py-2">{feedback.success}</div>
      )}

      {activeTab === "turnos" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 p-3">
              <h5 className="fw-bold mb-3">Reservar Turno</h5>
              <form onSubmit={handleCreateReservation}>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Cancha</label>
                  <select
                    className="form-select"
                    value={resForm.facility_id}
                    onChange={(e) =>
                      setResForm({ ...resForm, facility_id: e.target.value })
                    }
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
                      value={resForm.start_time}
                      onChange={(e) =>
                        setResForm({ ...resForm, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Hasta</label>
                    <input
                      type="time"
                      className="form-control"
                      value={resForm.end_time}
                      onChange={(e) =>
                        setResForm({ ...resForm, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold">
                    Nombre del Cliente / Socio
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={resForm.client_name}
                    onChange={(e) =>
                      setResForm({ ...resForm, client_name: e.target.value })
                    }
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold">Teléfono</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={resForm.client_phone}
                    onChange={(e) =>
                      setResForm({ ...resForm, client_phone: e.target.value })
                    }
                  />
                </div>

                <div className="row mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold">
                      Precio ($)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={resForm.final_price}
                      onChange={(e) =>
                        setResForm({ ...resForm, final_price: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Pago</label>
                    <select
                      className="form-select"
                      value={resForm.payment_method}
                      onChange={(e) =>
                        setResForm({
                          ...resForm,
                          payment_method: e.target.value,
                        })
                      }
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="mercadopago">Mercado Pago</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-dark w-100 mt-2">
                  Confirmar Reserva
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Turnos Programados</h5>
                <input
                  type="date"
                  className="form-control w-auto"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setResForm((prev) => ({
                      ...prev,
                      reservation_date: e.target.value,
                    }));
                  }}
                />
              </div>

              {loading ? (
                <LoadingSpinner message="Cargando turnos..." />
              ) : reservations.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No hay turnos registrados para este día.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Horario</th>
                        <th>Cancha</th>
                        <th>Jugador</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r) => (
                        <tr key={r.idreservations}>
                          <td className="fw-bold">{`${r.start_time} - ${r.end_time}`}</td>
                          <td>{r.court_name}</td>
                          <td>
                            <div>{r.client_name}</div>
                            <small className="text-muted">
                              {r.client_phone}
                            </small>
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
                          <td>
                            {r.status !== "cancelada" && (
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
      )}

      {activeTab === "escuelita" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 p-3 mb-4">
              <h5 className="fw-bold mb-3">Nuevo Grupo / Horario</h5>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-2">
                  <label className="form-label small fw-bold">
                    Nombre del Grupo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Menores Avanzados"
                    className="form-control"
                    value={groupForm.name}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Día</label>
                  <select
                    className="form-select text-capitalize"
                    value={groupForm.day_of_week}
                    onChange={(e) =>
                      setGroupForm({
                        ...groupForm,
                        day_of_week: e.target.value,
                      })
                    }
                  >
                    {[
                      "lunes",
                      "martes",
                      "miercoles",
                      "jueves",
                      "viernes",
                      "sabado",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
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
                      value={groupForm.start_time}
                      onChange={(e) =>
                        setGroupForm({
                          ...groupForm,
                          start_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Hasta</label>
                    <input
                      type="time"
                      className="form-control"
                      value={groupForm.end_time}
                      onChange={(e) =>
                        setGroupForm({ ...groupForm, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Profesor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={groupForm.coach_name}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, coach_name: e.target.value })
                    }
                  />
                </div>
                <button type="submit" className="btn btn-dark w-100 mt-2">
                  Crear Grupo
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-3">
              <h5 className="fw-bold mb-3">Grupos y Alumnos Inscriptos</h5>
              <div className="d-flex gap-2 mb-3 overflow-auto pb-2">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGroup(g);
                      loadStudents(g.id);
                    }}
                    className={`btn btn-sm ${
                      selectedGroup?.id === g.id
                        ? "btn-dark"
                        : "btn-outline-secondary"
                    }`}
                  >
                    {g.name} ({g.day_of_week} {g.start_time})
                  </button>
                ))}
              </div>

              {selectedGroup && (
                <>
                  <div className="card bg-light p-3 border-0 mb-3">
                    <h6 className="fw-bold mb-2">
                      Inscribir Alumno a {selectedGroup.name}
                    </h6>
                    <form onSubmit={handleAddStudent} className="row g-2">
                      <div className="col-md-5">
                        <input
                          type="text"
                          required
                          placeholder="Nombre y Apellido"
                          className="form-control form-control-sm"
                          value={studentForm.full_name}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              full_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          required
                          placeholder="Teléfono"
                          className="form-control form-control-sm"
                          value={studentForm.phone}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <button
                          type="submit"
                          className="btn btn-sm btn-dark w-100"
                        >
                          Añadir
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Alumno</th>
                          <th>Teléfono</th>
                          <th>Estado Cuota</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.id}>
                            <td className="fw-bold">{s.full_name}</td>
                            <td>{s.phone}</td>
                            <td>
                              <span
                                className={`badge ${
                                  s.status === "al_dia"
                                    ? "bg-success"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {s.status === "al_dia" ? "Al día" : "Pendiente"}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-success me-1"
                                onClick={() =>
                                  handleStudentStatus(s.id, "al_dia")
                                }
                              >
                                Al Día
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() =>
                                  handleStudentStatus(s.id, "moroso")
                                }
                              >
                                Pendiente
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
