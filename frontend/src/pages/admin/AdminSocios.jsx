import { useEffect, useState, useCallback } from "react";
import {
  getMembers,
  registerMember,
  updateMemberStatus,
  uploadMemberPhoto,
  applyPrepaidPlan,
} from "../../service/member.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  sendDebtorReminders,
  broadcastCampaign,
} from "../../service/member.service";

export default function AdminSocios() {
  const { addToast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Modal Plan Adelantado
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [planForm, setPlanForm] = useState({
    months: 12,
    planName: "Iluminación - Cancha 3 - Tenis",
    amountPaid: "",
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // Estado del nuevo socio
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
    createdAt: new Date().toISOString().split("T")[0],
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

  const [sendingEmails, setSendingEmails] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignData, setCampaignData] = useState({
    title: "",
    message: "",
    projectGoal: "",
    linkAction: "",
  });

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

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

  const handleSendDebtorReminders = async () => {
    if (
      !window.confirm(
        "¿Deseas enviar un correo recordatorio con link de pago a todos los socios deudores?",
      )
    )
      return;
    setSendingEmails(true);
    try {
      const res = await sendDebtorReminders();
      addToast(res.message, "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSendingEmails(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setSendingEmails(true);
    try {
      const res = await broadcastCampaign(campaignData);
      addToast(res.message, "success");
      setShowCampaignModal(false);
      setCampaignData({
        title: "",
        message: "",
        projectGoal: "",
        linkAction: "",
      });
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSendingEmails(false);
    }
  };

  const openPlanModal = (member) => {
    setSelectedMember(member);
    setPlanForm({
      months: 12,
      planName: "Iluminación Cancha 3 Tenis",
      amountPaid: "",
    });
    setShowPlanModal(true);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSavingPlan(true);

    try {
      const id = selectedMember.idmembers || selectedMember.id;
      const res = await applyPrepaidPlan(id, planForm);
      addToast(res.message, "success");
      setShowPlanModal(false);
      fetchSocios();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSavingPlan(false);
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
      createdAt: new Date().toISOString().split("T")[0],
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Padrón de Socios</h2>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm fw-bold px-3 py-2"
            onClick={handleSendDebtorReminders}
            disabled={sendingEmails}
          >
            {sendingEmails ? "Enviando..." : "Notificar Deudores"}
          </button>

          <button
            type="button"
            className="btn btn-outline-dark btn-sm fw-bold px-3 py-2"
            onClick={() => setShowCampaignModal(true)}
          >
            Difundir Proyecto / Obra
          </button>

          <button
            type="button"
            className="btn btn-dark btn-sm fw-bold px-3 py-2"
            onClick={() => setShowModal(true)}
          >
            + Nuevo Socio
          </button>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Tabla */}
      <div className="card border-0 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="ps-3">N° Socio</th>
                <th>Foto</th>
                <th>Nombre y apellido</th>
                <th>DNI / CUIT</th>
                <th>Fecha ingreso</th>
                <th>Categoría</th>
                <th>Cuota paga hasta</th>
                <th>Estado</th>
                <th className="text-end pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingSpinner message="Cargando socios..." />
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    No se encontraron socios con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const id = member.idmembers || member.id;
                  const name = `${member.first_name || member.firstName} ${member.last_name || member.lastName}`;
                  const currentStatus = member.status || "active";
                  const photo = member.photo_url || member.photoUrl;

                  let planInfo = null;
                  if (member.prepaid_plan) {
                    try {
                      planInfo =
                        typeof member.prepaid_plan === "string"
                          ? JSON.parse(member.prepaid_plan)
                          : member.prepaid_plan;
                    } catch (e) {
                      planInfo = null;
                    }
                  }

                  return (
                    <tr key={id}>
                      <td className="ps-3 fw-bold text-muted">
                        #{String(member.member_number || id).padStart(4, "0")}
                      </td>
                      <td>
                        {photo ? (
                          <img
                            src={photo}
                            alt={name}
                            className="rounded-circle object-fit-cover"
                            style={{ width: "36px", height: "36px" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center text-muted fw-bold"
                            style={{
                              width: "36px",
                              height: "36px",
                              fontSize: "13px",
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
                      <td className="small text-muted">
                        {formatDate(member.created_at)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {categoryLabels[member.category] ||
                            member.category ||
                            "General"}
                        </span>
                      </td>
                      <td className="small">
                        {member.category === "honorario" ? (
                          <span className="text-muted fst-italic">Exento</span>
                        ) : member.paid_until ? (
                          <div>
                            <strong>{formatDate(member.paid_until)}</strong>
                            {planInfo && (
                              <div>
                                <span
                                  className="badge bg-info text-dark"
                                  style={{ fontSize: "10px" }}
                                >
                                  {planInfo.planName || "Plan Obra"} (
                                  {planInfo.monthsPrepaid}m)
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">Sin registro</span>
                        )}
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
                      <td className="text-end pe-3">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm py-0 px-2"
                            title="Cargar pago voluntario anticipado / aporte de obras"
                            onClick={() => openPlanModal(member)}
                            disabled={member.category === "honorario"}
                          >
                            + Plan Obra
                          </button>
                          <select
                            className="form-select form-select-sm d-inline-block w-auto py-0"
                            value={currentStatus}
                            onChange={(e) =>
                              handleStatusChange(id, e.target.value)
                            }
                          >
                            <option value="active">Al Día</option>
                            <option value="debtor">Deudor</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Carga Plan Adelantado / Obras */}
      {showPlanModal && selectedMember && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  Plan anticipado / Aporte obras y proyectos
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPlanModal(false)}
                ></button>
              </div>

              <form onSubmit={handlePlanSubmit}>
                <div className="modal-body p-4">
                  <p className="small mb-3">
                    Socio:{" "}
                    <strong>
                      {selectedMember.first_name} {selectedMember.last_name}
                    </strong>{" "}
                    (DNI: {selectedMember.dni})
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Motivo / Proyecto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Iluminación Cancha 3 Tenis / Compra Terreno"
                      className="form-control form-control-sm"
                      value={planForm.planName}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, planName: e.target.value })
                      }
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Cuotas adelantadas *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={planForm.months}
                        onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            months: Number(e.target.value),
                          })
                        }
                      >
                        <option value={3}>3 meses</option>
                        <option value={6}>6 meses (Semestre)</option>
                        <option value={12}>12 meses (1 Año)</option>
                        <option value={24}>24 meses (2 Años)</option>
                        <option value={36}>36 meses (3 Años)</option>
                        <option value={48}>48 meses (4 Años)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Monto total aportado ($)
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 120000"
                        className="form-control form-control-sm"
                        value={planForm.amountPaid}
                        onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            amountPaid: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="alert alert-info py-2 small mb-0">
                    Al confirmar, el sistema extenderá automáticamente la fecha
                    de vencimiento del socio por{" "}
                    <strong>{planForm.months} meses</strong> y no pasará a
                    deudor hasta cumplido el período.
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowPlanModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingPlan}
                    className="btn btn-sm btn-primary fw-bold px-3"
                  >
                    {savingPlan ? "Guardando..." : "Confirmar Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Socio con Fecha de Ingreso */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">Registrar nuevo socio</h5>
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
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">
                        Categoría *
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
                        <option value="cadete">Cadete / Juvenil</option>
                        <option value="familiar">Grupo Familiar</option>
                        <option value="vitalicio">Socio Vitalicio</option>
                        <option value="honorario">Socio Honorario</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">
                        N° Socio
                      </label>
                      <input
                        type="number"
                        placeholder="Automático"
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

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">
                        Fecha de Ingreso *
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={newMember.createdAt}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            createdAt: e.target.value,
                          })
                        }
                      />
                    </div>

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

                    {/* Foto */}
                    <div className="col-12 border-top pt-3">
                      <label className="form-label small fw-bold d-block">
                        Foto del rostro
                      </label>
                      <div className="d-flex align-items-center gap-3">
                        {photoPreview && (
                          <img
                            src={photoPreview}
                            alt="Vista previa"
                            className="rounded-circle object-fit-cover border"
                            style={{ width: "50px", height: "50px" }}
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

                    {/* Cadete */}
                    {newMember.category === "cadete" && (
                      <div className="col-12 bg-light p-3 rounded-2 border mt-3">
                        <h6 className="fw-bold mb-2">
                          Datos del tutor / Responsable
                        </h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="form-label small">
                              Nombre completo
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
                            <label className="form-label small">DNI</label>
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
                            <label className="form-label small">Teléfono</label>
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
                              <option value="Tutor Legal">Tutor legal</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Familiar */}
                    {newMember.category === "familiar" && (
                      <div className="col-12 bg-light p-3 rounded-2 border mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">
                            Integrantes familiares
                          </h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            onClick={addFamilyMember}
                          >
                            + Agregar integrante
                          </button>
                        </div>
                        {newMember.familyMembers.length === 0 ? (
                          <p className="text-muted small mb-0">
                            No se agregaron familiares.
                          </p>
                        ) : (
                          newMember.familyMembers.map((fam, index) => (
                            <div
                              key={index}
                              className="row g-2 align-items-end mb-2 border-bottom pb-2"
                            >
                              <div className="col-4">
                                <label className="form-label small mb-1">
                                  Nombre
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
                    {submitting ? "Guardando..." : "Registrar Socio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal Difundir Proyecto / Obra */}
      {showCampaignModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">
                  Difundir proyecto / obra
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCampaignModal(false)}
                ></button>
              </div>
              <form onSubmit={handleBroadcastSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Asunto del Email *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Sumate a la Iluminación Cancha 3 / Campaña Metro Cuadrado"
                      className="form-control form-control-sm"
                      value={campaignData.title}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Objetivo del proyecto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Instalar reflectores LED profesionales para torneos nocturnos"
                      className="form-control form-control-sm"
                      value={campaignData.projectGoal}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          projectGoal: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Mensaje para la masa societaria *
                    </label>
                    <textarea
                      required
                      rows="4"
                      placeholder="Explicá en qué consiste la obra, el beneficio para el club y cómo colaborar..."
                      className="form-control form-control-sm"
                      value={campaignData.message}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          message: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold">
                      Enlace de acción / Más información
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="form-control form-control-sm"
                      value={campaignData.linkAction}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          linkAction: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowCampaignModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmails}
                    className="btn btn-sm btn-dark fw-bold px-3"
                  >
                    {sendingEmails
                      ? "Enviando correos..."
                      : "Enviar Comunicado"}
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
