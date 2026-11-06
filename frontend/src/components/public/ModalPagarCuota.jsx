import { useState } from "react";
import api from "../../service/api";

export default function ModalPagarCuota({ show, onClose }) {
  const [identifier, setIdentifier] = useState("");
  const [member, setMember] = useState(null);
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el valor mensual del socio (o 5000 por defecto)
  const monthlyRate = member?.monthlyFee || 5000;

  if (!show) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMember(null);

    try {
      const { data } = await api.get(
        `/payments/check-debt?identifier=${encodeURIComponent(identifier.trim())}`,
      );
      setMember(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al consultar socio",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/payments/create-preference", {
        memberId: member.id || member.idmembers,
        months: Number(months),
      });

      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        throw new Error("No se pudo generar el enlace de pago.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al procesar el pago",
      );
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString("es-AR");
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-black text-white">
            <h5 className="modal-title fw-bold">Pagar Cuota Social</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger small mb-3">{error}</div>
            )}

            {!member ? (
              <form onSubmit={handleSearch}>
                <label className="form-label small fw-bold">
                  Ingresá tu DNI o N° de Socio
                </label>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    required
                    placeholder="Ej: 45168948"
                    className="form-control"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <button
                    className="btn btn-dark fw-bold px-3"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Buscando..." : "Consultar"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="bg-light p-3 rounded mb-3 border">
                  <h6 className="fw-bold mb-1">
                    {member.firstName} {member.lastName}
                  </h6>
                  <p className="small text-muted mb-1">
                    DNI: <strong>{member.dni}</strong> | N° Socio:{" "}
                    <strong>
                      #{String(member.memberNumber || "").padStart(4, "0")}
                    </strong>
                  </p>
                  <p className="small mb-0">
                    Estado:{" "}
                    <span
                      className={`badge ${member.isUpToDate ? "bg-success" : "bg-danger"}`}
                    >
                      {member.statusLabel}
                    </span>
                    {member.paidUntil && (
                      <span
                        className="ms-2 text-muted"
                        style={{ fontSize: "12px" }}
                      >
                        (Cuota cubierta hasta: {formatDate(member.paidUntil)})
                      </span>
                    )}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    {member.isUpToDate
                      ? "¿Deseás adelantar cuotas?"
                      : "¿Cuántas cuotas vas a abonar?"}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                  >
                    <option value={1}>
                      1 Mes - ${(monthlyRate * 1).toLocaleString("es-AR")}
                    </option>
                    <option value={3}>
                      3 Meses (Trimestre) - $
                      {(monthlyRate * 3).toLocaleString("es-AR")}
                    </option>
                    <option value={6}>
                      6 Meses (Semestre) - $
                      {(monthlyRate * 6).toLocaleString("es-AR")}
                    </option>
                    <option value={12}>
                      12 Meses (1 Año) - $
                      {(monthlyRate * 12).toLocaleString("es-AR")}
                    </option>
                    <option value={24}>
                      24 Meses (2 Años) - $
                      {(monthlyRate * 24).toLocaleString("es-AR")}
                    </option>
                  </select>
                </div>

                {member.category === "familiar" && (
                  <div className="small text-muted mt-1">
                    Plan Familiar: incluye titular + {member.totalMembers - 1}{" "}
                    integrante(s) (${monthlyRate.toLocaleString("es-AR")}/mes).
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
                  <span className="fw-bold">Total a abonar:</span>
                  <span className="fs-5 fw-bold text-primary">
                    ${(monthlyRate * months).toLocaleString("es-AR")}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 py-2 fw-bold"
                  style={{ backgroundColor: "#009ee3", borderColor: "#009ee3" }}
                  onClick={handlePay}
                  disabled={loading}
                >
                  {loading ? "Generando link..." : "Pagar con Mercado Pago"}
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-muted text-decoration-none"
                    onClick={() => setMember(null)}
                  >
                    ← Buscar otro socio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
