import { useEffect, useState, useCallback } from "react";
import {
  getMembers,
  registerMember,
  updateMemberStatus,
} from "../../service/member.service";

export default function AdminSocios() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
    category: "activo",
  });
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchSocios = useCallback(async () => {
    try {
      const data = await getMembers();
      setMembers(data || []);
    } catch (error) {
      console.error("Error al cargar socios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await getMembers();
        if (isMounted) {
          setMembers(data || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error al cargar socios:", error);
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

  const filteredMembers = members.filter((m) => {
    const fullName =
      `${m.first_name || m.firstName || ""} ${m.last_name || m.lastName || ""}`.toLowerCase();
    const dni = String(m.dni || "");
    const matchesSearch =
      fullName.includes(search.toLowerCase()) || dni.includes(search);
    const matchesStatus = statusFilter === "todos" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateMemberStatus(id, newStatus);
      setMembers((prev) =>
        prev.map((m) =>
          m.idmembers === id || m.id === id ? { ...m, status: newStatus } : m,
        ),
      );
    } catch (error) {
      alert("Error al actualizar el estado del socio.");
      console.log("Error al actualizar el estado del socio:", error);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      await registerMember(newMember);
      setShowModal(false);
      setNewMember({
        firstName: "",
        lastName: "",
        dni: "",
        email: "",
        phone: "",
        category: "activo",
      });
      fetchSocios();
    } catch (error) {
      setFeedbackMsg(
        error.response?.data?.message || "Error al guardar el socio.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Padrón de Socios</h2>
          <p className="text-muted small mb-0">
            Administración general, altas directas y control de estado de cuotas
            de El Depor.
          </p>
        </div>
        <button
          className="btn btn-dark fw-bold btn-socio px-4 py-2"
          onClick={() => setShowModal(true)}
        >
          + Nuevo Socio
        </button>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por apellido, nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="pendiente">Pendientes</option>
              <option value="inactivo">Inactivos / Bajas</option>
            </select>
          </div>
          <div className="col-12 col-md-2 text-md-end text-muted small">
            <strong>{filteredMembers.length}</strong> registrados
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="ps-4">Socio / Nombre</th>
                <th>DNI</th>
                <th>Contacto</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div
                      className="spinner-border text-dark"
                      role="status"
                    ></div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No se encontraron socios con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const id = member.idmembers || member.id;
                  const name = `${member.first_name || member.firstName} ${member.last_name || member.lastName}`;
                  const currentStatus = member.status || "activo";

                  return (
                    <tr key={id}>
                      <td className="ps-4 fw-bold text-dark">{name}</td>
                      <td>{member.dni}</td>
                      <td className="small">
                        <div>{member.email || "-"}</div>
                        <div className="text-muted">{member.phone || "-"}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {member.category || "General"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            currentStatus === "activo"
                              ? "bg-success"
                              : currentStatus === "pendiente"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(id, e.target.value)
                          }
                        >
                          <option value="activo">Activo</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="inactivo">Inactivo</option>
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
                <h5 className="modal-title fw-bold">Registrar Nuevo Socio</h5>
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
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={newMember.firstName}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={newMember.lastName}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">DNI *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={newMember.dni}
                        onChange={(e) =>
                          setNewMember({ ...newMember, dni: e.target.value })
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
                        value={newMember.phone}
                        onChange={(e) =>
                          setNewMember({ ...newMember, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={newMember.email}
                        onChange={(e) =>
                          setNewMember({ ...newMember, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Categoría
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={newMember.category}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="activo">Socio Activo</option>
                        <option value="cadete">Cadete / Juvenil</option>
                        <option value="familiar">Grupo Familiar</option>
                      </select>
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
                    {submitting ? "Guardando..." : "Registrar Socio"}
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
