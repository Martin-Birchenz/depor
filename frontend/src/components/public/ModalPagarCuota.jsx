import { useState } from "react";

export default function ModalPagarCuota({ show, onClose }) {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [paying, setPaying] = useState(false);

  if (!show) return null;

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/payments/check-debt?identifier=${encodeURIComponent(identifier)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "No se encontró ningún socio con ese DNI o N° de socio.",
        );
      }

      setResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/payments/create-preference`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: result.member.id }),
        },
      );
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint; // Redirige a Mercado Pago
      } else {
        throw new Error("No se pudo iniciar el proceso de pago");
      }
    } catch (err) {
      setErrorMsg(err.message);
      setPaying(false);
    }
  };

  const resetAll = () => {
    setIdentifier("");
    setResult(null);
    setErrorMsg(null);
    setPaying(false);
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-black text-white">
            <h5 className="modal-title fw-bold">Pago de cuota mensual</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={resetAll}
            ></button>
          </div>

          <div className="modal-body p-4">
            {!result ? (
              <form onSubmit={handleCheck}>
                <label className="form-label fw-semibold small">
                  Ingresá tu DNI o número de socio
                </label>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    required
                    placeholder="Ej: 42123456 o 852"
                    className="form-control"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <button
                    className="btn btn-dark fw-bold px-3"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Consultando..." : "Consultar"}
                  </button>
                </div>
                {errorMsg && (
                  <div className="alert alert-danger py-2 small mb-0">
                    {errorMsg}
                  </div>
                )}
              </form>
            ) : (
              <div>
                <h6 className="fw-bold mb-1">{result.member?.name}</h6>
                <p className="text-muted small mb-3">
                  Socio #
                  {String(result.member?.memberNumber || "").padStart(4, "0")} —{" "}
                  <span className="text-uppercase">
                    {result.member?.category}
                  </span>
                </p>

                {result.status === "exempt" ? (
                  <div className="alert alert-info py-2 small">
                    {result.message}
                  </div>
                ) : result.status === "up_to_date" ? (
                  <div className="alert alert-success py-2 small">
                    Tu cuota ya se encuentra al día. Muchas gracias por apoyar a
                    el club.
                  </div>
                ) : (
                  <div className="card p-3 bg-light border-0 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Estado actual:</span>
                      <span className="badge bg-danger">Cuota Pendiente</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Total a abonar:</span>
                      <span className="fs-5 fw-bold text-dark">
                        ${result.amount?.toLocaleString("es-AR")}
                      </span>
                    </div>

                    <button
                      className="btn btn-primary w-100 fw-bold mt-3 py-2"
                      style={{
                        backgroundColor: "#009ee3",
                        borderColor: "#009ee3",
                      }}
                      onClick={handlePay}
                      disabled={paying}
                    >
                      {paying
                        ? "Redirigiendo a Mercado Pago..."
                        : "Pagar con Mercado Pago / Tarjetas"}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                  onClick={() => setResult(null)}
                >
                  ← Consultar otro DNI
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
