import { useState } from "react";
import { registerCampParticipant } from "../../service/camp.service";

export default function Colonia() {
  const [activeTab, setActiveTab] = useState("colonia");
  const [formData, setFormData] = useState({
    childFirstName: "",
    childLastName: "",
    childDni: "",
    birthDate: "",
    tutorName: "",
    tutorPhone: "",
    tutorEmail: "",
    shift: "mañana",
    medicalNotes: "",
    isMember: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const minorFullName =
      `${formData.childFirstName.trim()} ${formData.childLastName.trim()}`.trim();

    const payload = {
      minorFullName,
      minorBirthDate: formData.birthDate,
      guardianName: formData.tutorName.trim(),
      guardianPhone: formData.tutorPhone.trim(),
      // Campos opcionales / complementarios
      guardianEmail: formData.tutorEmail.trim() || undefined,
      dni: String(formData.childDni).trim() || undefined,
      shift: formData.shift,
      medicalNotes: formData.medicalNotes.trim() || undefined,
      isMember: Boolean(formData.isMember),
    };

    try {
      await registerCampParticipant(payload);
      setSuccessMessage(
        "¡Preinscripción a la colonia registrada con éxito! La coordinación se comunicará para confirmar la vacante.",
      );
      setFormData({
        childFirstName: "",
        childLastName: "",
        childDni: "",
        birthDate: "",
        tutorName: "",
        tutorPhone: "",
        tutorEmail: "",
        shift: "mañana",
        medicalNotes: "",
        isMember: false,
      });
    } catch (error) {
      const details = error.response?.data?.errors
        ?.map((err) => err.message)
        .join(", ");
      const msg =
        details ||
        error.response?.data?.message ||
        "Error al procesar la preinscripción.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container text-center mb-4">
        <h1 className="section-title mb-2">Temporada de Pileta</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "650px" }}>
          Actividades acuáticas en el predio del club: colonia infantil y pileta
          libre para adultos.
        </p>

        <div className="d-flex justify-content-center gap-2 mt-4">
          <button
            type="button"
            className={`btn px-4 py-2 fw-bold ${activeTab === "colonia" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setActiveTab("colonia")}
          >
            Colonia Infantil (4 a 12 años)
          </button>
          <button
            type="button"
            className={`btn px-4 py-2 fw-bold ${activeTab === "libre" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setActiveTab("libre")}
          >
            Pileta Libre y Adultos
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "950px" }}>
        {activeTab === "libre" ? (
          <div className="row g-4 mt-2">
            <div className="col-12 col-md-6">
              <div className="card h-100 bg-black text-white p-4 border-0 shadow">
                <h3 className="socios-title mb-4 border-bottom border-secondary pb-2">
                  Natación y Pileta Libre
                </h3>
                <ul className="list-unstyled d-flex flex-column gap-3 small">
                  <li>
                    <strong className="text-white">
                      Horarios de andariveles:
                    </strong>{" "}
                    Lunes a Sábados de 12:30 a 14:30 y de 19:00 a 21:30.
                  </li>
                  <li>
                    <strong className="text-white">Requisitos:</strong> Revisión
                    médica al día y carnet de pileta.
                  </li>
                  <li>
                    <strong className="text-white">
                      Tarifas diferenciadas:
                    </strong>{" "}
                    Descuento del 40% en abono mensual para socios activos con
                    cuota al día.
                  </li>
                  <li>
                    <strong className="text-white">Opciones de pase:</strong>{" "}
                    Por clase individual, abono libre mensual o temporada
                    completa.
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 bg-white p-4 p-md-5 border-0 shadow-sm d-flex flex-column justify-content-center text-center">
                <h4 className="fw-bold mb-3">¿Querés venir a nadar?</h4>
                <p className="text-muted small mb-4">
                  El acceso a pileta libre no requiere completar formulario de
                  tutor. Podés consultar disponibilidad de andarivel o gestionar
                  tu abono directamente por WhatsApp con el encargado.
                </p>
                <a
                  href="https://wa.me/5493435000000?text=Hola!%20Quería%20consultar%20por%20los%20horarios%20y%20abonos%20para%20pileta%20libre%20en%20el%20club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark py-3 fw-bold btn-socio"
                >
                  Consultar horarios por WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4 mt-2">
            <div className="col-12 col-md-5">
              <div className="card h-100 bg-black text-white p-4 border-0 shadow">
                <h3 className="socios-title mb-4 border-bottom border-secondary pb-2">
                  Colonia de Verano
                </h3>
                <ul className="list-unstyled d-flex flex-column gap-3 small">
                  <li>
                    <strong className="text-white">Período:</strong> Diciembre a
                    Febrero.
                  </li>
                  <li>
                    <strong className="text-white">Turnos:</strong> Mañana
                    (09:00 a 12:30) y Tarde (14:30 a 18:00).
                  </li>
                  <li>
                    <strong className="text-white">Actividades:</strong> Clases
                    de natación diarias, fútbol, tenis, talleres y campamento.
                  </li>
                  <li>
                    <strong className="text-white">Beneficio de socio:</strong>{" "}
                    Tarifa bonificada en cuota mensual.
                  </li>
                </ul>
                <div className="mt-auto pt-3 border-top border-secondary text-white-50 small">
                  Destinado a colonos de 4 a 12 años.
                </div>
              </div>
            </div>

            <div className="col-12 col-md-7">
              <div className="card bg-white p-4 p-md-5 border-0 shadow-sm">
                <h3 className="fw-bold mb-4">Preinscripción Infantil</h3>

                {successMessage && (
                  <div className="alert alert-success small mb-4">
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="alert alert-danger small mb-4">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                    Datos del Niño/a
                  </h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="childFirstName"
                        required
                        className="form-control"
                        value={formData.childFirstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        name="childLastName"
                        required
                        className="form-control"
                        value={formData.childLastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">DNI *</label>
                      <input
                        type="text"
                        name="childDni"
                        required
                        placeholder="Sin puntos"
                        className="form-control"
                        value={formData.childDni}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        required
                        className="form-control"
                        value={formData.birthDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold small">
                      Turno preferido *
                    </label>
                    <select
                      name="shift"
                      className="form-select"
                      value={formData.shift}
                      onChange={handleChange}
                    >
                      <option value="mañana">
                        Turno Mañana (09:00 a 12:30)
                      </option>
                      <option value="tarde">Turno Tarde (14:30 a 18:00)</option>
                    </select>
                  </div>

                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                    Adulto Responsable (Tutor)
                  </h6>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      name="tutorName"
                      required
                      className="form-control"
                      value={formData.tutorName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        name="tutorPhone"
                        required
                        placeholder="Ej: 3435123456"
                        className="form-control"
                        value={formData.tutorPhone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="tutorEmail"
                        required
                        className="form-control"
                        value={formData.tutorEmail}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">
                      Alergias o consideraciones médicas
                    </label>
                    <textarea
                      name="medicalNotes"
                      rows="2"
                      placeholder="Indicar si posee alguna alergia, medicación especial..."
                      className="form-control"
                      value={formData.medicalNotes}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isMemberCheck"
                      name="isMember"
                      checked={formData.isMember}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor="isMemberCheck"
                    >
                      ¿El niño/a o tutor es socio activo del club?
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-dark w-100 py-3 fw-bold btn-socio"
                  >
                    {loading
                      ? "Procesando preinscripción..."
                      : "Enviar Preinscripción"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
