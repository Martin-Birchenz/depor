import { useState, useEffect } from "react";
import {
  getPelotaPaletaCourts,
  getPelotaPaletaReservations,
  createPelotaPaletaReservation,
  updatePelotaPaletaReservationStatus,
  getBuffetProducts,
  createBuffetProduct,
  createBuffetSale,
  getBuffetRecentSales,
} from "../../service/pelotaPaleta.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminPelotaPaleta() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("cancha");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [courts, setCourts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [resForm, setResForm] = useState({
    facility_id: "",
    client_name: "",
    client_phone: "",
    reservation_date: today,
    start_time: "19:00",
    end_time: "20:00",
    final_price: 9000,
    payment_method: "pendiente",
    notes: "",
  });

  const [products, setProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "bebida",
    cost_price: 0,
    sale_price: 1500,
    stock: 24,
  });
  const [salePaymentMethod, setSalePaymentMethod] = useState("efectivo");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: null, success: null });

  async function loadCourts() {
    try {
      const data = await getPelotaPaletaCourts();
      setCourts(data);
      if (data.length > 0) {
        setResForm((prev) => ({
          ...prev,
          facility_id: data[0].idfacilities,
          final_price: Number(data[0].default_price) || 9000,
        }));
      }
    } catch {
      setFeedback({
        error: "Error al cargar la cancha de pelota paleta",
        success: null,
      });
    }
  }

  async function loadReservations(date) {
    try {
      setLoading(true);
      const data = await getPelotaPaletaReservations(date);
      setReservations(data);
    } catch {
      setFeedback({
        error: "Error al cargar turnos del trinquete",
        success: null,
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadBuffetData() {
    try {
      const [prods, sales] = await Promise.all([
        getBuffetProducts(),
        getBuffetRecentSales(),
      ]);
      setProducts(prods);
      setRecentSales(sales);
    } catch {
      setFeedback({ error: "Error al cargar datos del buffet", success: null });
    }
  }

  useEffect(() => {
    loadCourts();
  }, []);

  useEffect(() => {
    if (activeTab === "cancha") {
      loadReservations(selectedDate);
    } else {
      loadBuffetData();
    }
  }, [activeTab, selectedDate]);

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setFeedback({ error: null, success: null });
    try {
      await createPelotaPaletaReservation({
        ...resForm,
        facility_id: Number(resForm.facility_id),
        final_price: Number(resForm.final_price),
      });
      setFeedback({ success: "Turno reservado con éxito", error: null });
      loadReservations(selectedDate);
      setResForm((prev) => ({
        ...prev,
        client_name: "",
        client_phone: "",
        notes: "",
      }));
      addToast("Turno reservado con éxito", "success");
    } catch (err) {
      addToast("Error al reservar el turno.", "error");
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePelotaPaletaReservationStatus(id, status);
      loadReservations(selectedDate);
      addToast("Turno actualizado con éxito", "success");
    } catch {
      addToast("Error al actualizar el turno.", "error");
      console.error(err);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          unit_price: Number(product.sale_price),
          quantity: 1,
          subtotal: Number(product.sale_price),
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCheckoutSale = async () => {
    if (cart.length === 0) return;
    try {
      await createBuffetSale({
        payment_method: salePaymentMethod,
        items: cart,
      });
      setCart([]);
      loadBuffetData();
      addToast("Venta registrada con éxito", "success");
    } catch (err) {
      addToast("Error al registrar venta.", "error");
      console.error(err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createBuffetProduct({
        ...productForm,
        cost_price: Number(productForm.cost_price),
        sale_price: Number(productForm.sale_price),
        stock: Number(productForm.stock),
      });
      setFeedback({ success: "Producto agregado al buffet", error: null });
      loadBuffetData();
      setProductForm({
        name: "",
        category: "bebida",
        cost_price: 0,
        sale_price: 1500,
        stock: 24,
      });
      addToast("Producto agregado al buffet", "success");
    } catch (err) {
      setFeedback({
        error: err.response?.data?.message || "Error al crear producto",
        success: null,
      });
      console.error(err);
      addToast("Error al crear producto.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Subcomisión de Pelota Paleta</h2>
          <span className="text-muted small">
            Gestión del Trinquete y Buffet de Cancha
          </span>
        </div>

        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "cancha" ? "active btn-dark" : "text-dark"}`}
              onClick={() => setActiveTab("cancha")}
            >
              Turnos de Cancha
            </button>
          </li>
          <li className="nav-item ms-2">
            <button
              className={`nav-link ${activeTab === "buffet" ? "active btn-dark" : "text-dark"}`}
              onClick={() => setActiveTab("buffet")}
            >
              Comedor
            </button>
          </li>
        </ul>
      </div>

      {feedback.error && (
        <div className="alert alert-danger py-2">{feedback.error}</div>
      )}
      {feedback.success && (
        <div className="alert alert-success py-2">{feedback.success}</div>
      )}

      {activeTab === "cancha" && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 p-3">
              <h5 className="fw-bold mb-3">Reservar Trinquete</h5>
              <form onSubmit={handleCreateReservation}>
                <div className="mb-2">
                  <label className="form-label small fw-bold">
                    Instalación
                  </label>
                  <select
                    className="form-select"
                    value={resForm.facility_id}
                    onChange={(e) =>
                      setResForm({ ...resForm, facility_id: e.target.value })
                    }
                  >
                    {courts.map((c) => (
                      <option key={c.idfacilities} value={c.idfacilities}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Desde</label>
                    <input
                      type="time"
                      className="form-control"
                      value={resForm.start_time}
                      onChange={(e) =>
                        setResForm({ ...resForm, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Hasta</label>
                    <input
                      type="time"
                      className="form-control"
                      value={resForm.end_time}
                      onChange={(e) =>
                        setResForm({ ...resForm, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold">
                    Jugador / Contacto
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={resForm.client_name}
                    onChange={(e) =>
                      setResForm({ ...resForm, client_name: e.target.value })
                    }
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold">Teléfono</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={resForm.client_phone}
                    onChange={(e) =>
                      setResForm({ ...resForm, client_phone: e.target.value })
                    }
                  />
                </div>

                <div className="row mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold">
                      Precio ($)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={resForm.final_price}
                      onChange={(e) =>
                        setResForm({ ...resForm, final_price: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Pago</label>
                    <select
                      className="form-select"
                      value={resForm.payment_method}
                      onChange={(e) =>
                        setResForm({
                          ...resForm,
                          payment_method: e.target.value,
                        })
                      }
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="mercadopago">Mercado Pago</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Notas</label>
                  <input
                    type="text"
                    placeholder="Pelotas, paletas prestadas, etc."
                    className="form-control"
                    value={resForm.notes}
                    onChange={(e) =>
                      setResForm({ ...resForm, notes: e.target.value })
                    }
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100">
                  Confirmar Turno
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Turnos Programados</h5>
                <input
                  type="date"
                  className="form-control w-auto"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setResForm((prev) => ({
                      ...prev,
                      reservation_date: e.target.value,
                    }));
                  }}
                />
              </div>

              {loading ? (
                <LoadingSpinner message="Cargando turnos..." />
              ) : reservations.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No hay turnos registrados para esta fecha.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Horario</th>
                        <th>Jugador</th>
                        <th>Pago</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r) => (
                        <tr key={r.idreservations}>
                          <td className="fw-bold">{`${r.start_time} - ${r.end_time}`}</td>
                          <td>
                            <div>{r.client_name}</div>
                            <small className="text-muted">
                              {r.client_phone}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                r.payment_method === "pendiente"
                                  ? "bg-warning text-dark"
                                  : "bg-info text-dark"
                              }`}
                            >
                              {r.payment_method} (${r.final_price})
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                r.status === "confirmada"
                                  ? "bg-success"
                                  : r.status === "cancelada"
                                    ? "bg-danger"
                                    : "bg-secondary"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>
                            {r.status === "confirmada" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleStatusChange(
                                    r.idreservations,
                                    "cancelada",
                                  )
                                }
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "buffet" && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 p-3 mb-4">
              <h5 className="fw-bold mb-3">Productos Disponibles</h5>
              <div className="row g-2">
                {products.length === 0 ? (
                  <p className="text-muted small">
                    No hay productos cargados en el buffet.
                  </p>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="col-md-4 col-sm-6">
                      <div
                        className="card h-100 p-2 border text-center cursor-pointer shadow-sm"
                        style={{
                          cursor: p.stock > 0 ? "pointer" : "not-allowed",
                          opacity: p.stock > 0 ? 1 : 0.6,
                        }}
                        onClick={() => addToCart(p)}
                      >
                        <span className="fw-bold small">{p.name}</span>
                        <span className="text-success fw-bold">
                          ${p.sale_price}
                        </span>
                        <small className="text-muted">Stock: {p.stock}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card shadow-sm border-0 p-3">
              <h6 className="fw-bold mb-2">Añadir Producto al Buffet</h6>
              <form onSubmit={handleCreateProduct} className="row g-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    required
                    placeholder="Producto"
                    className="form-control form-control-sm"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="bebida">Bebida</option>
                    <option value="comida">Comida</option>
                    <option value="kiosco">Kiosco</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    required
                    placeholder="Precio"
                    className="form-control form-control-sm"
                    value={productForm.sale_price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        sale_price: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-sm btn-dark w-100">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 p-3 mb-4">
              <h5 className="fw-bold mb-3">Ticket Actual</h5>
              {cart.length === 0 ? (
                <p className="text-muted text-center py-4">
                  Seleccioná productos de la grilla para vender.
                </p>
              ) : (
                <>
                  <ul className="list-group list-group-flush mb-3">
                    {cart.map((item) => (
                      <li
                        key={item.product_id}
                        className="list-group-item d-flex justify-content-between align-items-center px-0"
                      >
                        <div>
                          <div className="fw-semibold">{item.name}</div>
                          <small className="text-muted">
                            {item.quantity} x ${item.unit_price}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">${item.subtotal}</span>
                          <button
                            className="btn btn-sm btn-outline-danger py-0 px-2"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            &times;
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
                    <span className="h5 fw-bold mb-0">Total:</span>
                    <span className="h4 fw-bold text-success mb-0">
                      ${cartTotal}
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Medio de Pago
                    </label>
                    <select
                      className="form-select"
                      value={salePaymentMethod}
                      onChange={(e) => setSalePaymentMethod(e.target.value)}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="debito">Débito</option>
                    </select>
                  </div>

                  <button
                    className="btn btn-dark w-100 py-2"
                    onClick={handleCheckoutSale}
                  >
                    Cobrar Ticket
                  </button>
                </>
              )}
            </div>

            <div className="card shadow-sm border-0 p-3">
              <h6 className="fw-bold mb-2">Últimas Ventas</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle small mb-0">
                  <tbody>
                    {recentSales.map((s) => (
                      <tr key={s.id}>
                        <td>{s.formatted_date}</td>
                        <td className="text-capitalize">{s.payment_method}</td>
                        <td className="text-end fw-bold">${s.total_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
