import { useEffect, useState, useCallback } from "react";
import {
  getMembers,
  registerMember,
  updateMemberStatus,
} from "../../service/member.service";
import { uploadMemberPhoto } from "../../service/member.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminSocios() {
  const { addToast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Estado del nuevo socio con soporte dinámico
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    cuit: "",
    email: "",
    phone: "",
    category: "general",
    memberNumber: "",
    photoUrl: "",
    tutorInfo: {
      fullName: "",
      dni: "",
      phone: "",
      relationship: "Padre/Madre",
    },
    familyMembers: [],
  });

  const categoryLabels = {
    general: "Socio General",
    cadete: "Cadete / Juvenil",
    familiar: "Grupo Familiar",
    vitalicio: "Vitalicio",
    honorario: "Socio Honorario",
  };

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
    fetchSocios();
  }, [fetchSocios]);

  // Manejo de foto seleccionada
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Manejo de integrantes para Grupo Familiar
  const addFamilyMember = () => {
    setNewMember((prev) => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { fullName: "", dni: "", relationship: "Hijo/a", birthDate: "" },
      ],
    }));
  };

  const removeFamilyMember = (index) => {
    setNewMember((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const updateFamilyMember = (index, field, value) => {
    setNewMember((prev) => {
      const updated = [...prev.familyMembers];
      updated[index][field] = value;
      return { ...prev, familyMembers: updated };
    });
  };

  const filteredMembers = members.filter((m) => {
    const fullName =
      `${m.first_name || m.firstName || ""} ${m.last_name || m.lastName || ""}`.toLowerCase();
    const dni = String(m.dni || "");
    const cuit = String(m.cuit || "");
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      dni.includes(search) ||
      cuit.includes(search);
    const memberStatus = m.status || "active";
    const matchesStatus =
      statusFilter === "todos" || memberStatus === statusFilter;
    const matchesCategory =
      categoryFilter === "todas" || m.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateMemberStatus(id, newStatus);
      setMembers((prev) =>
        prev.map((m) =>
          m.idmembers === id || m.id === id ? { ...m, status: newStatus } : m,
        ),
      );
      addToast("Estado actualizado con éxito", "success");
    } catch (error) {
      addToast("Error al actualizar el estado del socio.", "error");
    }
  };

  const resetForm = () => {
    setNewMember({
      firstName: "",
      lastName: "",
      dni: "",
      cuit: "",
      email: "",
      phone: "",
      category: "general",
      memberNumber: "",
      photoUrl: "",
      tutorInfo: {
        fullName: "",
        dni: "",
        phone: "",
        relationship: "Padre/Madre",
      },
      familyMembers: [],
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let uploadedUrl = newMember.photoUrl;

      // Si seleccionó una foto, la subimos a Cloudinary
      if (photoFile) {
        uploadedUrl = await uploadMemberPhoto(photoFile);
      }

      const payload = {
        ...newMember,
        photoUrl: uploadedUrl,
        memberNumber: newMember.memberNumber
          ? Number(newMember.memberNumber)
          : null,
      };

      await registerMember(payload);
      setShowModal(false);
      resetForm();
      fetchSocios();
      addToast("Socio registrado con éxito", "success");
    } catch (error) {
      addToast("Error al guardar el socio.", "error");
      console.error(error);
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
          className="btn btn-dark fw-bold px-4 py-2"
          onClick={() => setShowModal(true)}
        >
          + Nuevo Socio
        </button>
      </div>

      {/* Filtros de Búsqueda, Estado y Categoría */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por apellido, nombre, DNI o CUIT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="active">Al Día / Activos</option>
              <option value="debtor">Deudores</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              <option value="general">Socio General</option>
              <option value="cadete">Cadete / Juvenil</option>
              <option value="familiar">Grupo Familiar</option>
              <option value="vitalicio">Vitalicio</option>
              <option value="honorario">Socio Honorario</option>
            </select>
          </div>
          <div className="col-12 col-md-1 text-md-end text-muted small">
            <strong>{filteredMembers.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabla del Padrón */}
      <div className="card border-0 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="ps-4">N° Socio</th>
                <th>Foto</th>
                <th>Socio / Nombre</th>
                <th>DNI / CUIT</th>
                <th>Contacto</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingSpinner message="Cargando socios..." />
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No se encontraron socios con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const id = member.idmembers || member.id;
                  const name = `${member.first_name || member.firstName} ${member.last_name || member.lastName}`;
                  const currentStatus = member.status || "active";
                  const photo = member.photo_url || member.photoUrl;

                  return (
                    <tr key={id}>
                      <td className="ps-4 fw-bold text-muted">
                        #{String(member.member_number || id).padStart(4, "0")}
                      </td>
                      <td>
                        {photo ? (
                          <img
                            src={photo}
                            alt={name}
                            className="rounded-circle object-fit-cover"
                            style={{ width: "38px", height: "38px" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center text-muted fw-bold"
                            style={{
                              width: "38px",
                              height: "38px",
                              fontSize: "14px",
                            }}
                          >
                            {name.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="fw-bold text-dark">{name}</td>
                      <td className="small">
                        <div>DNI: {member.dni}</div>
                        {member.cuit && (
                          <div className="text-muted">CUIT: {member.cuit}</div>
                        )}
                      </td>
                      <td className="small">
                        <div>{member.email || "-"}</div>
                        <div className="text-muted">{member.phone || "-"}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {categoryLabels[member.category] ||
                            member.category ||
                            "Socio General"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            currentStatus === "active"
                              ? "bg-success"
                              : currentStatus === "debtor"
                                ? "bg-danger"
                                : "bg-secondary"
                          }`}
                        >
                          {currentStatus === "active"
                            ? "Al Día"
                            : currentStatus === "debtor"
                              ? "Deudor"
                              : "Inactivo"}
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
                          <option value="active">Al Día</option>
                          <option value="debtor">Deudor</option>
                          <option value="inactive">Inactivo</option>
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

      {/* Modal Dinámico para Alta de Socio */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">Registrar Nuevo Socio</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>

              <form onSubmit={handleModalSubmit}>
                <div
                  className="modal-body p-4"
                  style={{ maxHeight: "75vh", overflowY: "auto" }}
                >
                  <div className="row g-3">
                    {/* Selector de Categoría */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">
                        Categoría de Socio *
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
                        <option value="general">Socio General</option>
                        <option value="cadete">Cadete / Juvenil (Menor)</option>
                        <option value="familiar">Grupo Familiar</option>
                        <option value="vitalicio">Vitalicio</option>
                        <option value="honorario">Socio Honorario</option>
                      </select>
                    </div>

                    {/* Número Histórico Opcional */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">
                        N° de Socio (opcional, histórico)
                      </label>
                      <input
                        type="number"
                        placeholder="Dejar vacío para correlativo automático"
                        className="form-control form-control-sm"
                        value={newMember.memberNumber}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            memberNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Datos Personales Básicos */}
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
                      <label className="form-label small fw-bold">CUIT</label>
                      <input
                        type="text"
                        placeholder="Opcional"
                        className="form-control form-control-sm"
                        value={newMember.cuit}
                        onChange={(e) =>
                          setNewMember({ ...newMember, cuit: e.target.value })
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

                    <div className="col-6">
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

                    {/* Carga de Foto de Rostro (Para adultos/titulares) */}
                    <div className="col-12 border-top pt-3">
                      <label className="form-label small fw-bold d-block">
                        Foto del Rostro (Titular / Responsable)
                      </label>
                      <div className="d-flex align-items-center gap-3">
                        {photoPreview && (
                          <img
                            src={photoPreview}
                            alt="Vista previa"
                            className="rounded-circle object-fit-cover border"
                            style={{ width: "55px", height: "55px" }}
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-sm"
                          onChange={handlePhotoChange}
                        />
                      </div>
                    </div>

                    {/* SECCIÓN DINÁMICA: Cadete (Requiere Tutor) */}
                    {newMember.category === "cadete" && (
                      <div className="col-12 bg-light p-3 rounded-2 border mt-3">
                        <h6 className="fw-bold mb-2">
                          Datos del Tutor / Responsable
                        </h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="form-label small">
                              Nombre Completo del Tutor
                            </label>
                            <input
                              type="text"
                              required
                              className="form-control form-control-sm"
                              value={newMember.tutorInfo.fullName}
                              onChange={(e) =>
                                setNewMember({
                                  ...newMember,
                                  tutorInfo: {
                                    ...newMember.tutorInfo,
                                    fullName: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">
                              DNI del Tutor
                            </label>
                            <input
                              type="text"
                              required
                              className="form-control form-control-sm"
                              value={newMember.tutorInfo.dni}
                              onChange={(e) =>
                                setNewMember({
                                  ...newMember,
                                  tutorInfo: {
                                    ...newMember.tutorInfo,
                                    dni: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">
                              Teléfono de Contacto
                            </label>
                            <input
                              type="text"
                              required
                              className="form-control form-control-sm"
                              value={newMember.tutorInfo.phone}
                              onChange={(e) =>
                                setNewMember({
                                  ...newMember,
                                  tutorInfo: {
                                    ...newMember.tutorInfo,
                                    phone: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">Vínculo</label>
                            <select
                              className="form-select form-select-sm"
                              value={newMember.tutorInfo.relationship}
                              onChange={(e) =>
                                setNewMember({
                                  ...newMember,
                                  tutorInfo: {
                                    ...newMember.tutorInfo,
                                    relationship: e.target.value,
                                  },
                                })
                              }
                            >
                              <option value="Padre/Madre">Padre/Madre</option>
                              <option value="Tutor Legal">Tutor Legal</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECCIÓN DINÁMICA: Grupo Familiar */}
                    {newMember.category === "familiar" && (
                      <div className="col-12 bg-light p-3 rounded-2 border mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">
                            Integrantes del Grupo Familiar
                          </h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            onClick={addFamilyMember}
                          >
                            + Agregar Integrante
                          </button>
                        </div>

                        {newMember.familyMembers.length === 0 ? (
                          <p className="text-muted small mb-0">
                            No se han agregado familiares.
                          </p>
                        ) : (
                          newMember.familyMembers.map((fam, index) => (
                            <div
                              key={index}
                              className="row g-2 align-items-end mb-2 border-bottom pb-2"
                            >
                              <div className="col-4">
                                <label className="form-label small mb-1">
                                  Nombre Completo
                                </label>
                                <input
                                  type="text"
                                  required
                                  className="form-control form-control-sm"
                                  value={fam.fullName}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      index,
                                      "fullName",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="col-3">
                                <label className="form-label small mb-1">
                                  DNI
                                </label>
                                <input
                                  type="text"
                                  required
                                  className="form-control form-control-sm"
                                  value={fam.dni}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      index,
                                      "dni",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="col-3">
                                <label className="form-label small mb-1">
                                  Vínculo
                                </label>
                                <input
                                  type="text"
                                  placeholder="Hijo/a, Cónyuge..."
                                  className="form-control form-control-sm"
                                  value={fam.relationship}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      index,
                                      "relationship",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="col-2 text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm w-100"
                                  onClick={() => removeFamilyMember(index)}
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-sm btn-dark px-3 fw-bold"
                  >
                    {submitting ? "Guardando y subiendo..." : "Registrar Socio"}
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
