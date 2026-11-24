import { useEffect, useState, useCallback } from "react";
import {
  getCanteenProducts,
  createCanteenProduct,
  getCanteenSales,
  getCanteenSummary,
  closeCanteenSession,
  recordCanteenSale,
} from "../../service/canteen.service";
import {
  getFootballPlayers,
  createFootballPlayer,
  updateFootballPlayer,
  deleteFootballPlayer,
  getFootballExpenses,
  createFootballExpense,
  closeFootballExpenses,
} from "../../service/football.service";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminFutbol() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("cantina");

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loadingCantina, setLoadingCantina] = useState(true);
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

  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [divisionFilter, setDivisionFilter] = useState("todas");
  const [insuranceFilter, setInsuranceFilter] = useState("todos");
  const [playerSearch, setPlayerSearch] = useState("");
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerForm, setPlayerForm] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    birthDate: "",
    phone: "",
    division: "primera",
    insuranceStatus: "pendiente_alta",
    insuranceValidUntil: "",
    notes: "",
  });

  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    concept: "",
    category: "policia",
    amount: "",
    paymentMethod: "efectivo",
    expenseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadAllData = useCallback(async () => {
    try {
      const [prodData, salesData, playersData, expensesData] =
        await Promise.all([
          getCanteenProducts(),
          getCanteenSales(),
          getFootballPlayers(),
          getFootballExpenses(),
        ]);
      setProducts(prodData || []);
      setSales(salesData || []);
      setPlayers(playersData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error("Error cargando datos de Fútbol:", error);
    } finally {
      setLoadingCantina(false);
      setLoadingPlayers(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
      loadAllData();
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
      addToast("Error al obtener resumen de la jornada", "error");
    }
  };

  const handleCloseSession = async () => {
    const confirmClose = window.confirm(
      "¿Cerrar la jornada actual de Fútbol? Se reiniciarán tanto la caja de cantina/ventas como los gastos operativos de la jornada.",
    );
    if (!confirmClose) return;

    try {
      await Promise.all([closeCanteenSession(), closeFootballExpenses()]);
      setShowSummaryModal(false);
      loadAllData();
      addToast("Jornada cerrada exitosamente. Balance reiniciado.", "success");
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
      loadAllData();
      addToast("Producto / Evento cargado con éxito", "success");
    } catch {
      addToast("Error al registrar producto.", "error");
    }
  };

  const openNewPlayerModal = () => {
    setEditingPlayer(null);
    setPlayerForm({
      firstName: "",
      lastName: "",
      dni: "",
      birthDate: "",
      phone: "",
      division: "primera",
      insuranceStatus: "pendiente_alta",
      insuranceValidUntil: "",
      notes: "",
    });
    setShowPlayerModal(true);
  };

  const openEditPlayerModal = (player) => {
    setEditingPlayer(player);
    setPlayerForm({
      firstName: player.first_name || "",
      lastName: player.last_name || "",
      dni: player.dni || "",
      birthDate: player.birth_date ? player.birth_date.split("T")[0] : "",
      phone: player.phone || "",
      division: player.division || "primera",
      insuranceStatus: player.insurance_status || "pendiente_alta",
      insuranceValidUntil: player.insurance_valid_until
        ? player.insurance_valid_until.split("T")[0]
        : "",
      notes: player.notes || "",
    });
    setShowPlayerModal(true);
  };

  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await updateFootballPlayer(editingPlayer.id, playerForm);
        addToast("Ficha del jugador actualizada", "success");
      } else {
        await createFootballPlayer(playerForm);
        addToast("Jugador incorporado al plantel", "success");
      }
      setShowPlayerModal(false);
      loadAllData();
    } catch {
      addToast("Error al guardar datos del jugador", "error");
    }
  };

  const handleQuickInsuranceChange = async (player, newStatus) => {
    try {
      await updateFootballPlayer(player.id, {
        ...player,
        firstName: player.first_name,
        lastName: player.last_name,
        birthDate: player.birth_date ? player.birth_date.split("T")[0] : null,
        insuranceStatus: newStatus,
        insuranceValidUntil: player.insurance_valid_until
          ? player.insurance_valid_until.split("T")[0]
          : null,
      });
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === player.id ? { ...p, insurance_status: newStatus } : p,
        ),
      );
      addToast("Estado de seguro actualizado", "success");
    } catch {
      addToast("Error al actualizar estado de seguro", "error");
    }
  };

  const handleDeletePlayer = async (id) => {
    if (!window.confirm("¿Eliminar definitivamente este jugador del registro?"))
      return;
    try {
      await deleteFootballPlayer(id);
      loadAllData();
      addToast("Jugador eliminado", "success");
    } catch {
      addToast("Error al eliminar jugador", "error");
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await createFootballExpense(expenseForm);
      setShowExpenseModal(false);
      setExpenseForm({
        concept: "",
        category: "policia",
        amount: "",
        paymentMethod: "efectivo",
        expenseDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      loadAllData();
      addToast("Egreso registrado en caja de Fútbol", "success");
    } catch {
      addToast("Error al registrar egreso", "error");
    }
  };

  const totalIngresos = sales.reduce(
    (acc, s) => acc + Number(s.total_amount || s.totalAmount || 0),
    0,
  );
  const totalEgresos = expenses.reduce(
    (acc, e) => acc + Number(e.amount || 0),
    0,
  );
  const balanceNeto = totalIngresos - totalEgresos;

  const filteredPlayers = players.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(playerSearch.toLowerCase()) ||
      String(p.dni).includes(playerSearch);
    const matchesDiv =
      divisionFilter === "todas" || p.division === divisionFilter;
    const matchesIns =
      insuranceFilter === "todos" || p.insurance_status === insuranceFilter;
    return matchesSearch && matchesDiv && matchesIns;
  });

  const pendientesAlta = players.filter(
    (p) => p.insurance_status === "pendiente_alta",
  ).length;
  const pendientesBaja = players.filter(
    (p) => p.insurance_status === "baja_solicitada",
  ).length;

  const expenseCategoryLabels = {
    policia: "Seguridad / Policía",
    seguro_social: "Pago Seguro Social",
    viajes: "Viajes / Traslados",
    arbitraje: "Arbitraje / Liga",
    mercaderia: "Mercadería Cantina / Pollada",
    otros: "Otros Gastos",
  };

  const insuranceBadges = {
    activo: { label: "Seguro Activo", cls: "bg-success" },
    pendiente_alta: { label: "Pendiente Alta", cls: "bg-warning text-dark" },
    baja_solicitada: { label: "Dar de Baja", cls: "bg-danger" },
    inactivo: { label: "Baja / Inactivo", cls: "bg-secondary" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("T")[0].split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Subcomisión de Fútbol</h2>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-danger btn-sm fw-bold px-3"
            onClick={() => setShowExpenseModal(true)}
          >
            - Registrar Gasto
          </button>
          <button
            className="btn btn-dark btn-sm fw-bold px-3"
            onClick={handleOpenSummary}
          >
            Resumen / Cierre de Jornada
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <span className="text-muted small fw-bold text-uppercase">
              Ingresos Cantina y Eventos
            </span>
            <h3 className="fw-bold text-success mt-1 mb-0">
              +${totalIngresos.toLocaleString("es-AR")}
            </h3>
            <small className="text-muted">
              {sales.length} ventas registradas
            </small>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <span className="text-muted small fw-bold text-uppercase">
              Gastos Operativos
            </span>
            <h3 className="fw-bold text-danger mt-1 mb-0">
              -${totalEgresos.toLocaleString("es-AR")}
            </h3>
            <small className="text-muted">
              {expenses.length} egresos en jornada
            </small>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <span className="text-muted small fw-bold text-uppercase">
              Saldo Neto en Caja Fútbol
            </span>
            <h3
              className={`fw-bold mt-1 mb-0 ${
                balanceNeto >= 0 ? "text-dark" : "text-danger"
              }`}
            >
              ${balanceNeto.toLocaleString("es-AR")}
            </h3>
            <small className="text-muted">
              Ingresos menos egresos del turno
            </small>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${
              activeTab === "cantina" ? "active text-dark" : "text-muted"
            }`}
            onClick={() => setActiveTab("cantina")}
          >
            Cantina y Ventas Especiales
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold d-flex align-items-center gap-2 ${
              activeTab === "plantel" ? "active text-dark" : "text-muted"
            }`}
            onClick={() => setActiveTab("plantel")}
          >
            Plantel y Seguro Social
            {(pendientesAlta > 0 || pendientesBaja > 0) && (
              <span className="badge bg-warning text-dark">
                {pendientesAlta + pendientesBaja} trámites
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${
              activeTab === "gastos" ? "active text-dark" : "text-muted"
            }`}
            onClick={() => setActiveTab("gastos")}
          >
            Gastos
          </button>
        </li>
      </ul>

      {/* ==================== TAB 1: CANTINA Y EVENTOS ==================== */}
      {activeTab === "cantina" && (
        <div>
          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-outline-dark btn-sm fw-bold px-3"
              onClick={() => setShowProductModal(true)}
            >
              + Agregar Producto
            </button>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm p-4 bg-white h-100">
                <h5 className="fw-bold mb-3">Mostrador y Ventas Especiales</h5>
                {loadingCantina ? (
                  <LoadingSpinner message="Cargando productos..." />
                ) : products.length === 0 ? (
                  <p className="text-muted small">
                    No hay productos ni eventos cargados.
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
                          <div>
                            {prod.category === "evento" && (
                              <span
                                className="badge bg-warning text-dark mb-1"
                                style={{ fontSize: "10px" }}
                              >
                                Evento
                              </span>
                            )}
                            <div className="fw-bold text-dark">{prod.name}</div>
                          </div>
                          <div className="mt-2 d-flex justify-content-between align-items-center w-100">
                            <span className="badge bg-dark">
                              $
                              {Number(
                                prod.sale_price || prod.salePrice,
                              ).toLocaleString("es-AR")}
                            </span>
                            <span className="text-muted small">
                              Disp: {prod.stock}
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
                    Seleccioná productos de la izquierda para cobrar.
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
                                {(
                                  item.salePrice * item.quantity
                                ).toLocaleString("es-AR")}
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
                          <option value="transferencia">
                            Transferencia / QR
                          </option>
                          <option value="debito">Débito</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={submittingSale}
                        className="btn btn-success w-100 py-2 fw-bold"
                        onClick={handleCheckout}
                      >
                        {submittingSale ? "Cobrando..." : "Registrar Cobro"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: PLANTEL Y SEGURO SOCIAL ==================== */}
      {activeTab === "plantel" && (
        <div>
          <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar jugador por nombre o DNI..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                >
                  <option value="todas">Todas las divisiones</option>
                  <option value="primera">Primera División</option>
                  <option value="sub23">Sub-23</option>
                </select>
              </div>
              <div className="col-6 col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={insuranceFilter}
                  onChange={(e) => setInsuranceFilter(e.target.value)}
                >
                  <option value="todos">Todos los estados de seguro</option>
                  <option value="pendiente_alta">Pendiente de Alta</option>
                  <option value="activo">Seguro Activo</option>
                  <option value="baja_solicitada">Para dar de Baja</option>
                  <option value="inactivo">Inactivos / Baja</option>
                </select>
              </div>
              <div className="col-12 col-md-2 text-md-end">
                <button
                  className="btn btn-dark btn-sm fw-bold w-100"
                  onClick={openNewPlayerModal}
                >
                  + Alta Jugador
                </button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th className="ps-3">Jugador</th>
                    <th>DNI / F. Nac</th>
                    <th>División</th>
                    <th>Estado Seguro Social</th>
                    <th>Cobertura hasta</th>
                    <th>Observaciones</th>
                    <th className="text-end pe-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPlayers ? (
                    <LoadingSpinner message="Cargando plantel..." />
                  ) : filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No hay jugadores registrados con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player) => {
                      const badge =
                        insuranceBadges[player.insurance_status] ||
                        insuranceBadges.pendiente_alta;

                      return (
                        <tr key={player.id}>
                          <td className="ps-3">
                            <div className="fw-bold text-dark">
                              {player.last_name}, {player.first_name}
                            </div>
                            {player.phone && (
                              <small className="text-muted">
                                Tel: {player.phone}
                              </small>
                            )}
                          </td>
                          <td className="small">
                            <div>DNI: {player.dni}</div>
                            <div className="text-muted">
                              Nac: {formatDate(player.birth_date)}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border text-uppercase">
                              {player.division === "sub23"
                                ? "Sub-23"
                                : "Primera"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="small">
                            {formatDate(player.insurance_valid_until)}
                          </td>
                          <td className="small text-muted">
                            {player.notes || "-"}
                          </td>
                          <td className="text-end pe-3">
                            <div className="d-flex justify-content-end align-items-center gap-2">
                              <select
                                className="form-select form-select-sm w-auto py-0"
                                value={player.insurance_status}
                                onChange={(e) =>
                                  handleQuickInsuranceChange(
                                    player,
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="pendiente_alta">
                                  Pendiente Alta
                                </option>
                                <option value="activo">Seguro Activo</option>
                                <option value="baja_solicitada">
                                  Solicitar Baja
                                </option>
                                <option value="inactivo">
                                  Baja Confirmada
                                </option>
                              </select>
                              <button
                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                onClick={() => openEditPlayerModal(player)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm py-0 px-2"
                                onClick={() => handleDeletePlayer(player.id)}
                              >
                                &times;
                              </button>
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
        </div>
      )}

      {/* ==================== TAB 3: GASTOS OPERATIVOS ==================== */}
      {activeTab === "gastos" && (
        <div className="card border-0 shadow-sm overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th className="ps-3">Fecha</th>
                  <th>Rubro</th>
                  <th>Concepto / Detalle</th>
                  <th>Medio de Pago</th>
                  <th className="text-end pe-3">Monto</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No hay gastos registrados en la jornada actual.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="ps-3 small">
                        {formatDate(exp.expense_date)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {expenseCategoryLabels[exp.category] || exp.category}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold">{exp.concept}</div>
                        {exp.notes && (
                          <small className="text-muted">{exp.notes}</small>
                        )}
                      </td>
                      <td className="small text-capitalize">
                        {exp.payment_method}
                      </td>
                      <td className="text-end pe-3 fw-bold text-danger">
                        -${Number(exp.amount).toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MODAL ALTA / EDICIÓN JUGADOR ==================== */}
      {showPlayerModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">
                  {editingPlayer
                    ? "Editar Jugador"
                    : "Alta de Jugador (Seguro Social)"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPlayerModal(false)}
                ></button>
              </div>
              <form onSubmit={handlePlayerSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={playerForm.firstName}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
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
                        value={playerForm.lastName}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
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
                        value={playerForm.dni}
                        onChange={(e) =>
                          setPlayerForm({ ...playerForm, dni: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Fecha Nacimiento
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={playerForm.birthDate}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
                            birthDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        División *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={playerForm.division}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
                            division: e.target.value,
                          })
                        }
                      >
                        <option value="primera">Primera División</option>
                        <option value="sub23">Sub-23</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={playerForm.phone}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Estado Seguro Social
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={playerForm.insuranceStatus}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
                            insuranceStatus: e.target.value,
                          })
                        }
                      >
                        <option value="pendiente_alta">
                          Pendiente de Alta
                        </option>
                        <option value="activo">Seguro Activo</option>
                        <option value="baja_solicitada">Solicitar Baja</option>
                        <option value="inactivo">Baja Confirmada</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Vencimiento Póliza
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={playerForm.insuranceValidUntil}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
                            insuranceValidUntil: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Observaciones
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Pase habilitado, falta certificado médico..."
                        className="form-control form-control-sm"
                        value={playerForm.notes}
                        onChange={(e) =>
                          setPlayerForm({
                            ...playerForm,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowPlayerModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-sm btn-dark fw-bold">
                    Guardar Ficha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL REGISTRAR GASTO ==================== */}
      {showExpenseModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  Registrar Egreso de Fútbol
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowExpenseModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateExpense}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Rubro *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={expenseForm.category}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="policia">Seguridad / Policía</option>
                        <option value="seguro_social">
                          Pago Seguro Social
                        </option>
                        <option value="viajes">
                          Viajes / Colectivo / Combustible
                        </option>
                        <option value="arbitraje">Arbitraje / Liga</option>
                        <option value="mercaderia">
                          Mercadería Cantina / Pollada
                        </option>
                        <option value="otros">Otros Gastos</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={expenseForm.expenseDate}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            expenseDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Concepto *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Adicional policía fecha 4 / Póliza seguro plantel"
                        className="form-control form-control-sm"
                        value={expenseForm.concept}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            concept: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Monto ($) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-control form-control-sm"
                        value={expenseForm.amount}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Medio de Pago
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={expenseForm.paymentMethod}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            paymentMethod: e.target.value,
                          })
                        }
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="debito">Débito</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowExpenseModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-danger fw-bold"
                  >
                    Guardar Egreso
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL PRODUCTO / POLLADA ==================== */}
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
                  Nuevo Ítem de Cantina o Venta Especial
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
                        placeholder="Ej: Pollo asado c/ ensalada, Choripán, Gaseosa..."
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
                        <option value="evento">Pollada / Venta Especial</option>
                        <option value="kiosco">Kiosco</option>
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
                        Cantidad / Stock Disponible
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
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL RESUMEN Y CIERRE ==================== */}
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
                  Resumen y Cierre de Jornada - Fútbol
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSummaryModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded text-center border">
                      <span className="small text-muted fw-bold d-block">
                        INGRESOS BRUTOS
                      </span>
                      <span className="fs-5 fw-bold text-success">
                        +$
                        {Number(dailySummary.summary.total).toLocaleString(
                          "es-AR",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded text-center border">
                      <span className="small text-muted fw-bold d-block">
                        GASTOS OPERATIVOS
                      </span>
                      <span className="fs-5 fw-bold text-danger">
                        -${totalEgresos.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded text-center border">
                      <span className="small text-muted fw-bold d-block">
                        SALDO NETO FINAL
                      </span>
                      <span className="fs-5 fw-bold text-dark">
                        $
                        {(
                          Number(dailySummary.summary.total) - totalEgresos
                        ).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Detalle de Ventas Despachadas</h6>
                {dailySummary.items.length === 0 ? (
                  <p className="text-muted small">
                    Sin ventas en esta jornada.
                  </p>
                ) : (
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "200px" }}
                  >
                    <table className="table table-sm table-hover align-middle">
                      <thead className="table-light small">
                        <tr>
                          <th>Artículo / Evento</th>
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
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
