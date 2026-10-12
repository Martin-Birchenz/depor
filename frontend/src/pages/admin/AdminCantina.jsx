import { useEffect, useState, useCallback } from "react";
import {
  getCanteenProducts,
  createCanteenProduct,
  getCanteenSales,
  getCanteenSummary,
  closeCanteenSession,
  recordCanteenSale,
} from "../../service/canteen.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminCantina() {
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [submittingSale, setSubmittingSale] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [dailySummary, setDailySummary] = useState(null);

  const [newProd, setNewProd] = useState({
    name: "",
    category: "comida",
    salePrice: "",
    stock: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const [prodData, salesData] = await Promise.all([
        getCanteenProducts(),
        getCanteenSales(),
      ]);
      setProducts(prodData || []);
      setSales(salesData || []);
    } catch (error) {
      console.error("Error cargando cantina:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          salePrice: Number(product.sale_price || product.salePrice),
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.salePrice * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmittingSale(true);
    try {
      await recordCanteenSale({
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });
      setCart([]);
      loadData();
      addToast("Venta registrada con éxito", "success");
    } catch {
      addToast("Error al registrar la venta.", "error");
    } finally {
      setSubmittingSale(false);
    }
  };

  const handleOpenSummary = async () => {
    try {
      const data = await getCanteenSummary();
      setDailySummary(data);
      setShowSummaryModal(true);
    } catch {
      alert("Error al obtener resumen de la jornada");
    }
  };

  const handleCloseSession = async () => {
    const confirmClose = window.confirm(
      "¿Estás seguro de cerrar la jornada actual? La caja volverá a $0 para el próximo evento (el stock de productos y el historial de ventas no se pierden).",
    );
    if (!confirmClose) return;

    try {
      await closeCanteenSession();
      setShowSummaryModal(false);
      loadData();
      addToast("Jornada cerrada exitosamente. Caja reiniciada.", "success");
    } catch {
      addToast("Error al cerrar la jornada.", "error");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createCanteenProduct({
        ...newProd,
        salePrice: Number(newProd.salePrice),
        stock: Number(newProd.stock),
      });
      setShowProductModal(false);
      setNewProd({ name: "", category: "comida", salePrice: "", stock: 0 });
      loadData();
      addToast("Producto registrado con éxito", "success");
    } catch {
      addToast("Error al registrar producto.", "error");
    }
  };

  const totalRecaudadoJornada = sales.reduce(
    (acc, s) => acc + Number(s.total_amount || s.totalAmount || 0),
    0,
  );

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Cantina y Buffet de Fútbol</h2>
          <p className="text-muted small mb-0">
            Punto de venta para jornadas de partidos, despacho rápido y caja
            acumulada.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-dark fw-bold px-3"
            onClick={handleOpenSummary}
          >
            Resumen / Cierre de Jornada
          </button>
          <button
            className="btn btn-outline-dark fw-bold px-3"
            onClick={() => setShowProductModal(true)}
          >
            + Insumo / Comida
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white">
            <span className="text-muted small fw-bold text-uppercase">
              Caja Jornada Actual
            </span>
            <h2 className="fw-bold text-success mt-2 mb-0">
              ${totalRecaudadoJornada.toLocaleString("es-AR")}
            </h2>
            <span className="text-muted small mt-1">
              {sales.length} tickets emitidos en este turno
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <h5 className="fw-bold mb-3">Menú Disponible</h5>
            {loading ? (
              <LoadingSpinner message="Cargando insumos..." />
            ) : products.length === 0 ? (
              <p className="text-muted small">
                No hay insumos cargados en cantina.
              </p>
            ) : (
              <div className="row g-3">
                {products.map((prod) => (
                  <div key={prod.id} className="col-6 col-md-4">
                    <button
                      type="button"
                      disabled={prod.stock <= 0}
                      className="btn btn-light border text-start w-100 p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ opacity: prod.stock > 0 ? 1 : 0.5 }}
                      onClick={() => addToCart(prod)}
                    >
                      <div className="fw-bold text-dark">{prod.name}</div>
                      <div className="mt-2 d-flex justify-content-between align-items-center w-100">
                        <span className="badge bg-dark">
                          $
                          {Number(
                            prod.sale_price || prod.salePrice,
                          ).toLocaleString("es-AR")}
                        </span>
                        <span className="text-muted small">
                          Stock: {prod.stock}
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 bg-white h-100 d-flex flex-column">
            <h5 className="fw-bold mb-3">Ticket Actual</h5>
            {cart.length === 0 ? (
              <div className="text-center py-5 text-muted my-auto">
                Seleccioná productos de la izquierda para despachar.
              </div>
            ) : (
              <>
                <div className="table-responsive flex-grow-1">
                  <table className="table table-sm align-middle">
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td className="fw-bold">{item.name}</td>
                          <td className="text-center">x{item.quantity}</td>
                          <td className="text-end fw-semibold">
                            $
                            {(item.salePrice * item.quantity).toLocaleString(
                              "es-AR",
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => removeFromCart(item.id)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-5 fw-bold">Total:</span>
                    <span className="fs-4 fw-bold text-success">
                      ${cartTotal.toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">
                      Medio de Pago:
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia / QR</option>
                      <option value="debito">Débito</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={submittingSale}
                    className="btn btn-success w-100 py-2 fw-bold"
                    onClick={handleCheckout}
                  >
                    {submittingSale
                      ? "Cobrando..."
                      : "Cobrar e Imprimir / Despachar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showSummaryModal && dailySummary && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  Resumen de Cierre de Jornada
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSummaryModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded text-center border">
                      <span className="small text-muted fw-bold d-block">
                        TOTAL CAJA
                      </span>
                      <span className="fs-5 fw-bold text-success">
                        $
                        {Number(dailySummary.summary.total).toLocaleString(
                          "es-AR",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded text-center border">
                      <span className="small text-muted fw-bold d-block">
                        EFECTIVO
                      </span>
                      <span className="fs-5 fw-bold">
                        $
                        {Number(dailySummary.summary.efectivo).toLocaleString(
                          "es-AR",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded text-center border">
                      <span className="small text-muted fw-bold d-block">
                        TRANSFERENCIA/QR
                      </span>
                      <span className="fs-5 fw-bold">
                        $
                        {Number(
                          dailySummary.summary.transferencia,
                        ).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded text-center border">
                      <span className="small text-muted fw-bold d-block">
                        DÉBITO
                      </span>
                      <span className="fs-5 fw-bold">
                        $
                        {Number(dailySummary.summary.debito).toLocaleString(
                          "es-AR",
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">
                  Artículos Despachados en esta Jornada
                </h6>
                {dailySummary.items.length === 0 ? (
                  <p className="text-muted small">
                    No se despacharon productos todavía.
                  </p>
                ) : (
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "250px" }}
                  >
                    <table className="table table-sm table-hover align-middle">
                      <thead className="table-light small">
                        <tr>
                          <th>Artículo</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Recaudado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailySummary.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="fw-bold">{it.name}</td>
                            <td className="text-center">{it.total_qty} u.</td>
                            <td className="text-end fw-semibold">
                              ${Number(it.total_amount).toLocaleString("es-AR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-danger fw-bold"
                  onClick={handleCloseSession}
                >
                  Cerrar Jornada y Reiniciar Caja
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSummaryModal(false)}
                >
                  Volver al Mostrador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">
                  Nuevo Producto de Cantina
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowProductModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateProduct}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Hamburguesa completa"
                        className="form-control form-control-sm"
                        value={newProd.name}
                        onChange={(e) =>
                          setNewProd({ ...newProd, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Rubro *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={newProd.category}
                        onChange={(e) =>
                          setNewProd({ ...newProd, category: e.target.value })
                        }
                      >
                        <option value="comida">Comida</option>
                        <option value="bebida">Bebida</option>
                        <option value="kiosco">Kiosco</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Precio Venta ($) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="form-control form-control-sm"
                        value={newProd.salePrice}
                        onChange={(e) =>
                          setNewProd({ ...newProd, salePrice: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Stock Inicial
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm"
                        value={newProd.stock}
                        onChange={(e) =>
                          setNewProd({ ...newProd, stock: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowProductModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-sm btn-dark fw-bold">
                    Guardar Producto
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
