import { useEffect, useState } from "react";
import {
  getCampRegistrations,
  updateCampRegistrationStatus,
} from "../../service/camp.service";

export default function AdminColonia() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState("todos");
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await getCampRegistrations();
        if (isMounted) {
          setRegistrations(data || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error al cargar colonia:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

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
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error al actualizar el estado de la inscripción.");
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

    return matchesSearch && matchesShift;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Colonia de Vacaciones y Pileta</h2>
          <p className="text-muted small mb-0">
            Control de inscriptos, asignación de turnos (mañana/tarde) y fichas
            de salud.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre del colono o tutor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
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
          <div className="col-12 col-md-2 text-md-end text-muted small">
            <strong>{filteredRegistrations.length}</strong> inscriptos
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
                <th className="text-end pe-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div
                      className="spinner-border text-dark"
                      role="status"
                    ></div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
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
                  const shift = reg.shift || "Mañana";
                  const notes =
                    reg.medical_notes ||
                    reg.medicalNotes ||
                    "Sin observaciones";
                  const isMember = reg.is_member ?? reg.isMember;
                  const status = reg.status || "pendiente";

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
                      <td className="text-end pe-4">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(id, e.target.value)
                          }
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="cancelada">Cancelada</option>
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
                  Observaciones de salud declaradas:
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
    </div>
  );
}
