import { useState } from "react";
import {
  registerMember,
  uploadMemberPhoto,
} from "../../service/member.service.js";

import ModalPagarCuota from "../../components/public/ModalPagarCuota.jsx";

export default function Socios() {
  const [showPagarCuota, setShowPagarCuota] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    cuit: "",
    email: "",
    phone: "",
    category: "general",
    tutorInfo: {
      fullName: "",
      dni: "",
      phone: "",
      relationship: "Padre/Madre",
    },
    familyMembers: [],
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Manejo de familiares convivientes
  const addFamilyMember = () => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { fullName: "", dni: "", relationship: "Hijo/a" },
      ],
    }));
  };

  const removeFamilyMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const updateFamilyMember = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.familyMembers];
      updated[index][field] = value;
      return { ...prev, familyMembers: updated };
    });
  };

  const handleSubmit = async (e, payOnline = true) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Subida obligatoria de la foto del rostro a Cloudinary
      let photoUrl = "";
      if (photoFile) {
        photoUrl = await uploadMemberPhoto(photoFile);
      } else {
        throw new Error(
          "Por favor, seleccioná una foto de tu rostro para el carnet.",
        );
      }

      // 2. Preparar el payload respetando el esquema del backend
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dni: String(formData.dni).trim(),
        cuit: formData.cuit ? String(formData.cuit).trim() : null,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        photoUrl: photoUrl,
        status: payOnline ? "debtor" : "debtor", // Se activa cuando se confirma el pago
        tutorInfo: formData.category === "cadete" ? formData.tutorInfo : null,
        familyMembers:
          formData.category === "familiar" ? formData.familyMembers : null,
      };

      const newMember = await registerMember(payload);

      if (payOnline) {
        // 3. Generar la preferencia de Mercado Pago y redirigir
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "/api"}/payments/create-preference`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              memberId: newMember.id || newMember.idmembers,
            }),
          },
        );

        const data = await res.json();
        if (data.initPoint) {
          window.location.href = data.initPoint;
          return;
        }
      }

      setSuccessMessage(
        "¡Solicitud registrada con éxito! Te esperamos en secretaría para abonar tu primera cuota y retirar tu carnet.",
      );
      setFormData({
        firstName: "",
        lastName: "",
        dni: "",
        cuit: "",
        email: "",
        phone: "",
        category: "general",
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
    } catch (error) {
      const details = error.response?.data?.errors
        ?.map((err) => err.message)
        .join(", ");
      const msg =
        details ||
        error.response?.data?.message ||
        error.message ||
        "Error al procesar tu solicitud.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container text-center mb-5">
        <h1 className="section-title mb-2">Asociate a El Depor</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "650px" }}>
          Formá parte de la historia del Barrio Lourdes. Con tu cuota social
          impulsás las obras del club y accedés a beneficios exclusivos en todas
          las disciplinas.
        </p>
      </div>

      <div className="alert alert-light border text-center mb-4 p-3">
        ¿Ya formás parte del club?{" "}
        <button
          type="button"
          className="btn btn-link p-0 fw-bold text-dark text-decoration-underline"
          onClick={() => setShowPagarCuota(true)}
        >
          Ingresá acá para abonar tu cuota mensual
        </button>
      </div>

      <ModalPagarCuota
        show={showPagarCuota}
        onClose={() => setShowPagarCuota(false)}
      />

      <div className="container" style={{ maxWidth: "960px" }}>
        <div className="row g-4 mb-5">
          {/* Tarjeta de Beneficios */}
          <div className="col-12 col-md-5">
            <div className="card h-100 bg-black text-white p-4 border-0 shadow">
              <h3 className="socios-title mb-4 border-bottom border-secondary pb-2">
                Beneficios de Socio
              </h3>
              <ul className="list-unstyled d-flex flex-column gap-3 small">
                <li>
                  <strong className="text-white">
                    ✔ Descuento en canchas:
                  </strong>{" "}
                  Tarifas especiales en Tenis, Pádel, Pelota Paleta y Fútbol 5.
                </li>
                <li>
                  <strong className="text-white">✔ Temporada de pileta:</strong>{" "}
                  Acceso y bonificaciones para la colonia.
                </li>
                <li>
                  <strong className="text-white">✔ Tienda oficial:</strong>{" "}
                  Precio exclusivo en indumentaria deportiva.
                </li>
                <li>
                  <strong className="text-white">✔ Eventos y salón:</strong>{" "}
                  Prioridad y precios diferenciados en alquiler de
                  instalaciones.
                </li>
              </ul>
              <div className="mt-auto pt-3 border-top border-secondary text-white-50 small">
                Sede Social: Mihura y Fritz Gerald, Nogoyá.
              </div>
            </div>
          </div>

          {/* Formulario de Registro Dinámico */}
          <div className="col-12 col-md-7">
            <div className="card bg-white p-4 p-md-5 border-0 shadow-sm">
              <h3 className="fw-bold mb-4">Completá tus datos</h3>

              {successMessage && (
                <div className="alert alert-success small mb-4" role="alert">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger small mb-4" role="alert">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={(e) => handleSubmit(e, true)}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Nombre *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="form-control form-control-sm"
                      placeholder="Ej: Juan"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="form-control form-control-sm"
                      placeholder="Ej: Pérez"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">DNI *</label>
                    <input
                      type="text"
                      name="dni"
                      required
                      className="form-control form-control-sm"
                      placeholder="Sin puntos"
                      value={formData.dni}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">CUIT</label>
                    <input
                      type="text"
                      name="cuit"
                      className="form-control form-control-sm"
                      placeholder="20-xxxxxxxx-x"
                      value={formData.cuit}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">
                      Categoría *
                    </label>
                    <select
                      name="category"
                      className="form-select form-select-sm"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="general">Socio General</option>
                      <option value="cadete">Cadete / Juvenil (Menor)</option>
                      <option value="familiar">Grupo Familiar</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="form-control form-control-sm"
                      placeholder="Ej: 3435123456"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-control form-control-sm"
                    placeholder="tunombre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Subida de Foto de Rostro */}
                <div className="mb-3 p-3 bg-light rounded border">
                  <label className="form-label fw-bold small d-block mb-1">
                    Foto de tu Rostro *
                  </label>
                  <small className="text-muted d-block mb-2">
                    Subí una foto nítida de frente tipo carnet.
                  </small>
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
                      required
                      className="form-control form-control-sm"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>

                {/* Campos dinámicos para Cadetes */}
                {formData.category === "cadete" && (
                  <div className="p-3 bg-light rounded border mb-3">
                    <h6 className="fw-bold mb-2">
                      Datos del Padre / Madre / Tutor Legal
                    </h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small">
                          Nombre del Tutor *
                        </label>
                        <input
                          type="text"
                          required
                          className="form-control form-control-sm"
                          value={formData.tutorInfo.fullName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tutorInfo: {
                                ...prev.tutorInfo,
                                fullName: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">
                          DNI del Tutor *
                        </label>
                        <input
                          type="text"
                          required
                          className="form-control form-control-sm"
                          value={formData.tutorInfo.dni}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tutorInfo: {
                                ...prev.tutorInfo,
                                dni: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">
                          Teléfono del Tutor *
                        </label>
                        <input
                          type="text"
                          required
                          className="form-control form-control-sm"
                          value={formData.tutorInfo.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tutorInfo: {
                                ...prev.tutorInfo,
                                phone: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Vínculo</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.tutorInfo.relationship}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tutorInfo: {
                                ...prev.tutorInfo,
                                relationship: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="Padre/Madre">Padre/Madre</option>
                          <option value="Tutor Legal">Tutor Legal</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos dinámicos para Grupo Familiar */}
                {formData.category === "familiar" && (
                  <div className="p-3 bg-light rounded border mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">
                        Integrantes Familiares a cargo
                      </h6>
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm"
                        onClick={addFamilyMember}
                      >
                        + Agregar Familiar
                      </button>
                    </div>
                    {formData.familyMembers.length === 0 ? (
                      <small className="text-muted">
                        Podés sumar a tus hijos y cónyuge bajo este mismo
                        legajo.
                      </small>
                    ) : (
                      formData.familyMembers.map((fam, index) => (
                        <div
                          key={index}
                          className="row g-2 align-items-end mb-2 border-bottom pb-2"
                        >
                          <div className="col-5">
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
                          <div className="col-4">
                            <label className="form-label small mb-1">DNI</label>
                            <input
                              type="text"
                              required
                              className="form-control form-control-sm"
                              value={fam.dni}
                              onChange={(e) =>
                                updateFamilyMember(index, "dni", e.target.value)
                              }
                            />
                          </div>
                          <div className="col-3 text-end">
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

                {/* Botones de acción: Pago Online vs Secretaría */}
                <div className="d-flex flex-column gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary py-3 fw-bold shadow-sm"
                    style={{
                      backgroundColor: "#009ee3",
                      borderColor: "#009ee3",
                    }}
                  >
                    {loading
                      ? "Procesando solicitud..."
                      : "Asociarme y pagar con Mercado Pago"}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    className="btn btn-outline-secondary py-2 btn-sm fw-semibold"
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    Prefiero asociarme y abonar en Secretaría
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
