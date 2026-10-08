import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginAdmin } from "../../service/auth.service";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await loginAdmin(credentials);
      login(data.user, data.token);
      navigate("/admin");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Credenciales inválidas. Verificá tu correo y contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <h2 className="socios-title mb-4">Club Deportivo Nogoyá</h2>
          <span className="text-muted small text-uppercase fw-bold">
            Sistema de Gestión
          </span>
        </div>

        {errorMsg && (
          <div className="alert alert-danger small py-2" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold small">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              className="form-control"
              value={credentials.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              className="form-control"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-dark w-100 py-2 fw-bold btn-socio"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
