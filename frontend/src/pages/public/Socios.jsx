import { useState } from "react";
import { registerMember } from "../../service/member.service.js";

export default function Socios() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
    category: "activo",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dni: String(formData.dni).trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      category: formData.category,
    };

    try {
      await registerMember(payload);
      setSuccessMessage("¡Gracias por tu interés! Te contactaremos en breve.");
      setFormData({
        firstName: "",
        lastName: "",
        dni: "",
        email: "",
        phone: "",
        category: "activo",
      });
    } catch (error) {
      const details = error.response?.data?.errors
        ?.map((err) => err.message)
        .join(", ");
      const msg =
        details ||
        error.response?.data?.message ||
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

      <div className="container" style={{ maxWidth: "900px" }}>
        <div className="row g-4 mb-5">
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
                  Tarifas especiales en Tenis, Pádel, Pelota Paleta y F5.
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

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Nombre *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="form-control"
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
                      className="form-control"
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
                      className="form-control"
                      placeholder="Sin puntos"
                      value={formData.dni}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">
                      Categoría *
                    </label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="activo">Activo</option>
                      <option value="cadete">Cadete</option>
                      <option value="infantil">Infantil</option>
                      <option value="vitalicio">Vitalicio</option>
                    </select>
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
                    className="form-control"
                    placeholder="tunombre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="form-control"
                    placeholder="Ej: 3435123456"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-dark w-100 py-3 fw-bold btn-socio"
                >
                  {loading ? "Enviando solicitud..." : "Confirmar Solicitud"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
