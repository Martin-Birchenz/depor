import { useState } from "react";

const VALOR_CUOTA = 5000; // O configurable según backend

export default function ModalPagarCuota({ show, onClose }) {
  const [identifier, setIdentifier] = useState("");
  const [member, setMember] = useState(null);
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!show) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMember(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/payments/check-debt?identifier=${encodeURIComponent(identifier.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Socio no encontrado");
      setMember(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/payments/create-preference`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: member.idmembers || member.id,
            months: Number(months),
          }),
        },
      );
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        throw new Error("No se pudo generar el enlace de pago.");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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
                    {member.first_name} {member.last_name}
                  </h6>
                  <p className="small text-muted mb-1">
                    DNI: {member.dni} | N° Socio: #{member.member_number}
                  </p>
                  <p className="small mb-0">
                    Estado actual:{" "}
                    <span
                      className={`badge ${member.status === "active" ? "bg-success" : "bg-danger"}`}
                    >
                      {member.status === "active" ? "Al Día" : "Deudor"}
                    </span>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    ¿Cuántos meses deseás abonar?
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                  >
                    <option value={1}>
                      1 Mes (Regular) - $
                      {(VALOR_CUOTA * 1).toLocaleString("es-AR")}
                    </option>
                    <option value={3}>
                      3 Meses (Trimestre) - $
                      {(VALOR_CUOTA * 3).toLocaleString("es-AR")}
                    </option>
                    <option value={6}>
                      6 Meses (Semestre) - $
                      {(VALOR_CUOTA * 6).toLocaleString("es-AR")}
                    </option>
                    <option value={12}>
                      12 Meses (1 Año) - $
                      {(VALOR_CUOTA * 12).toLocaleString("es-AR")}
                    </option>
                    <option value={24}>
                      24 Meses (2 Años) - $
                      {(VALOR_CUOTA * 24).toLocaleString("es-AR")}
                    </option>
                  </select>
                </div>

                <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
                  <span className="fw-bold">Total a pagar:</span>
                  <span className="fs-5 fw-bold text-primary">
                    ${(VALOR_CUOTA * months).toLocaleString("es-AR")}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
