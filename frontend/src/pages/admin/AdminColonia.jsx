import { useEffect, useState, useCallback } from "react";
import {
  getCampRegistrations,
  updateCampRegistrationStatus,
  registerCampParticipant,
} from "../../service/camp.service";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useToast } from "../../hooks/useToast";

export default function AdminColonia() {
  const { addToast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Modales
  const [selectedNote, setSelectedNote] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario manual de inscripción
  const [newParticipant, setNewParticipant] = useState({
    minorFullName: "",
    minorBirthDate: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    shift: "mañana",
    isMember: false,
    medicalNotes: "",
  });

  const loadData = useCallback(async () => {
    try {
      const data = await getCampRegistrations();
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error al cargar colonia:", error);
      addToast("Error al cargar listado de la colonia", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateCampRegistrationStatus(id, newStatus);
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.idcamp_registrations === id || reg.id === id
            ? { ...reg, status: newStatus }
            : reg,
        ),
      );
      addToast("Estado actualizado correctamente", "success");
    } catch (error) {
      addToast("Error al actualizar el estado", "error");
      console.error("Error:", error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerCampParticipant(newParticipant);
      addToast("Chico inscripto exitosamente en la colonia", "success");
      setShowCreateModal(false);
      setNewParticipant({
        minorFullName: "",
        minorBirthDate: "",
        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",
        shift: "mañana",
        isMember: false,
        medicalNotes: "",
      });
      loadData();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Error al inscribir al chico.",
        "error",
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const minorName = (
      reg.minor_full_name ||
      reg.minorFullName ||
      ""
    ).toLowerCase();
    const guardianName = (
      reg.guardian_name ||
      reg.guardianName ||
      ""
    ).toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      minorName.includes(query) || guardianName.includes(query);
    const regShift = (reg.shift || "").toLowerCase();
    const matchesShift =
      shiftFilter === "todos" || regShift === shiftFilter.toLowerCase();
    const regStatus = (reg.status || "pendiente").toLowerCase();
    const matchesStatus =
      statusFilter === "todos" || regStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesShift && matchesStatus;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Colonia de Vacaciones y Pileta</h2>
          <p className="text-muted small mb-0">
            Control de inscriptos, aptos médicos y administración de cupos por
            turno.
          </p>
        </div>
        <button
          className="btn btn-dark fw-bold px-4 py-2"
          onClick={() => setShowCreateModal(true)}
        >
          + Inscribir Chico
        </button>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por colono o tutor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
            >
              <option value="todos">Todos los turnos</option>
              <option value="mañana">Turno Mañana</option>
              <option value="tarde">Turno Tarde</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmado">Confirmados</option>
              <option value="pendiente">Pendientes</option>
              <option value="baja">Bajas</option>
            </select>
          </div>
          <div className="col-12 col-md-2 text-md-end text-muted small">
            <strong>{filteredRegistrations.length}</strong> chicos
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="ps-4">Menor / Nacimiento</th>
                <th>Tutor Responsable</th>
                <th>Contacto</th>
                <th>Turno</th>
                <th>Ficha Médica</th>
                <th>Condición</th>
                <th>Estado Actual</th>
                <th className="text-end pe-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <LoadingSpinner message="Cargando inscriptos..." />
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No se registran preinscripciones con esos criterios.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const id = reg.idcamp_registrations || reg.id;
                  const minorName = reg.minor_full_name || reg.minorFullName;
                  const birthDate = reg.minor_birth_date || reg.minorBirthDate;
                  const guardian = reg.guardian_name || reg.guardianName;
                  const phone = reg.guardian_phone || reg.guardianPhone;
                  const email = reg.guardian_email || reg.guardianEmail;
                  const shift = reg.shift || "mañana";
                  const notes =
                    reg.medical_notes ||
                    reg.medicalNotes ||
                    "Sin observaciones";
                  const isMember = reg.is_member ?? reg.isMember;
                  const status = (reg.status || "pendiente").toLowerCase();

                  return (
                    <tr key={id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{minorName}</div>
                        <div className="text-muted small">
                          Nac:{" "}
                          {birthDate
                            ? new Date(birthDate).toLocaleDateString("es-AR")
                            : "-"}
                        </div>
                      </td>
                      <td className="fw-semibold text-secondary">{guardian}</td>
                      <td className="small">
                        <div>{phone || "-"}</div>
                        <div className="text-muted">{email || "-"}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            shift.toLowerCase() === "mañana"
                              ? "bg-primary"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {shift.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary py-0 px-2 small"
                          onClick={() =>
                            setSelectedNote({ name: minorName, notes })
                          }
                        >
                          Ver ficha
                        </button>
                      </td>
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
                        <span
                          className={`badge ${
                            status === "confirmado"
                              ? "bg-success"
                              : status === "baja"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {status === "confirmado"
                            ? "Confirmado (Apto OK)"
                            : status === "baja"
                              ? "Baja / Cancelado"
                              : "Pendiente Doc/Pago"}
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
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmar</option>
                          <option value="baja">Dar de baja</option>
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

      {selectedNote && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">
                  Ficha Médica: {selectedNote.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedNote(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-2 fw-bold text-uppercase">
                  Alergias, medicamentos y observaciones de salud:
                </p>
                <div className="p-3 bg-light rounded border">
                  {selectedNote.notes}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-sm btn-dark"
                  onClick={() => setSelectedNote(null)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">
                  Inscripción Directa a Colonia
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-bold">
                        Nombre y Apellido del Chico/a *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={newParticipant.minorFullName}
                        onChange={(e) =>
                          setNewParticipant({
                            ...newParticipant,
                            minorFullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-bold">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={newParticipant.minorBirthDate}
                        onChange={(e) =>
                          setNewParticipant({
                            ...newParticipant,
                            minorBirthDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">
                        Nombre del Tutor Responsable *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={newParticipant.guardianName}
                        onChange={(e) =>
                          setNewParticipant({
                            ...newParticipant,
                            guardianName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">
                        Teléfono de Contacto / Urgencias *
                      </label>
                      <input
                        type="tel"
                        required
                        className="form-control form-control-sm"
                        value={newParticipant.guardianPhone}
                        onChange={(e) =>
                          setNewParticipant({
                            ...newParticipant,
                            guardianPhone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">
                        Turno de Colonia *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={newParticipant.shift}
                        onChange={(e) =>
                          setNewParticipant({
                            ...newParticipant,
                            shift: e.target.value,
                          })
                        }
                      >
                        <option value="mañana">
                          Turno Mañana (09:00 a 12:30)
                        </option>
                        <option value="tarde">
                          Turno Tarde (14:30 a 18:00)
                        </option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">
                        Condición Societaria
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={newParticipant.isMember ? "si" : "no"}
                        onChange={(e) =>
                          setNewParticipant({
                            ...newParticipant,
                            isMember: e.target.value === "si",
                          })
                        }
                      >
                        <option value="no">No Socio (Tarifa Plena)</option>
                        <option value="si">Socio Activo (Descuento)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Ficha Médica / Observaciones de Salud
                      </label>
                      <textarea
                        rows="3"
                        className="form-control form-control-sm"
                        placeholder="Alergias a picaduras, asma, medicación diaria, dietas especiales..."
                        value={newParticipant.medicalNotes}
                        onChange={(e) =>
                          setNewParticipant({
                            ...newParticipant,
                            medicalNotes: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-sm btn-dark px-3 fw-bold"
                  >
                    {submitting ? "Inscribiendo..." : "Registrar Inscripción"}
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
