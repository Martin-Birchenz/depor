import { useEffect, useState } from "react";
import {
  getYouthCategories,
  getYouthPlayers,
  createYouthPlayer,
  updateYouthPlayerStatus,
} from "../../service/youth.service";

export default function AdminInfantiles() {
  const [categories, setCategories] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    categoryId: "",
    firstName: "",
    lastName: "",
    dni: "",
    birthDate: "",
    guardianName: "",
    guardianPhone: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [catData, playData] = await Promise.all([
        getYouthCategories(),
        getYouthPlayers(),
      ]);
      setCategories(catData || []);
      setPlayers(playData || []);
      if (catData && catData.length > 0 && !newPlayer.categoryId) {
        setNewPlayer((prev) => ({ ...prev, categoryId: catData[0].id }));
      }
    } catch (error) {
      console.error("Error al cargar datos de infantiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [catData, playData] = await Promise.all([
          getYouthCategories(),
          getYouthPlayers(),
        ]);
        if (isMounted) {
          setCategories(catData || []);
          setPlayers(playData || []);
          if (catData && catData.length > 0) {
            setNewPlayer((prev) => ({ ...prev, categoryId: catData[0].id }));
          }
        }
      } catch (error) {
        if (isMounted) console.error("Error cargando infantiles:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateYouthPlayerStatus(id, newStatus);
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
      );
    } catch {
      alert("Error al actualizar estado del jugador.");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      await createYouthPlayer({
        ...newPlayer,
        categoryId: Number(newPlayer.categoryId),
      });
      setShowModal(false);
      setNewPlayer({
        categoryId: categories[0]?.id || "",
        firstName: "",
        lastName: "",
        dni: "",
        birthDate: "",
        guardianName: "",
        guardianPhone: "",
      });
      loadData();
    } catch (error) {
      setFeedbackMsg(
        error.response?.data?.message || "Error al inscribir al jugador.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlayers = players.filter((p) => {
    const fullName =
      `${p.first_name || p.firstName || ""} ${p.last_name || p.lastName || ""}`.toLowerCase();
    const dni = String(p.dni || "");
    const matchesSearch =
      fullName.includes(search.toLowerCase()) || dni.includes(search);

    const playerCatId = String(p.category_id || p.categoryId);
    const matchesCategory =
      selectedCategory === "todas" || playerCatId === String(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Fútbol Infantil El Depor</h2>
          <p className="text-muted small mb-0">
            Padrón de chicos por categoría (año de nacimiento), control de
            asistencia y tutores.
          </p>
        </div>
        <button
          className="btn btn-dark fw-bold btn-socio px-4 py-2"
          onClick={() => setShowModal(true)}
        >
          + Inscribir Chico
        </button>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.birth_year || c.birthYear})
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2 text-md-end text-muted small">
            <strong>{filteredPlayers.length}</strong> inscriptos
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="ps-4">Jugador / DNI</th>
                <th>Categoría</th>
                <th>Nacimiento</th>
                <th>Tutor Responsable</th>
                <th>Teléfono Contacto</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div
                      className="spinner-border text-dark"
                      role="status"
                    ></div>
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No se registran chicos en la categoría o búsqueda
                    seleccionada.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p) => {
                  const name = `${p.first_name || p.firstName} ${p.last_name || p.lastName}`;
                  const catName =
                    p.category_name ||
                    categories.find(
                      (c) =>
                        String(c.id) === String(p.category_id || p.categoryId),
                    )?.name ||
                    "Cat.";
                  const birth = p.birth_date || p.birthDate;
                  const guardian = p.guardian_name || p.guardianName;
                  const phone = p.guardian_phone || p.guardianPhone;
                  const status = p.status || "activo";

                  return (
                    <tr key={p.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{name}</div>
                        <div className="text-muted small">DNI: {p.dni}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-bold">
                          {catName}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {birth
                          ? new Date(birth).toLocaleDateString("es-AR")
                          : "-"}
                      </td>
                      <td className="fw-semibold text-secondary">{guardian}</td>
                      <td>
                        <a
                          href={`https://wa.me/549${phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-success py-0 px-2 small"
                        >
                          {phone}
                        </a>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            status === "activo" ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(p.id, e.target.value)
                          }
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title fw-bold">
                  Inscribir Jugador Infantil
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleModalSubmit}>
                <div className="modal-body p-4">
                  {feedbackMsg && (
                    <div className="alert alert-danger small py-2">
                      {feedbackMsg}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        Categoría *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={newPlayer.categoryId}
                        onChange={(e) =>
                          setNewPlayer({
                            ...newPlayer,
                            categoryId: e.target.value,
                          })
                        }
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.birth_year || c.birthYear})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={newPlayer.firstName}
                        onChange={(e) =>
                          setNewPlayer({
                            ...newPlayer,
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
                        value={newPlayer.lastName}
                        onChange={(e) =>
                          setNewPlayer({
                            ...newPlayer,
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
                        value={newPlayer.dni}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, dni: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Fecha Nacimiento *
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={newPlayer.birthDate}
                        onChange={(e) =>
                          setNewPlayer({
                            ...newPlayer,
                            birthDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Nombre Tutor *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={newPlayer.guardianName}
                        onChange={(e) =>
                          setNewPlayer({
                            ...newPlayer,
                            guardianName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">
                        Teléfono Tutor *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="3435..."
                        className="form-control form-control-sm"
                        value={newPlayer.guardianPhone}
                        onChange={(e) =>
                          setNewPlayer({
                            ...newPlayer,
                            guardianPhone: e.target.value,
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
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-sm btn-dark px-3 fw-bold"
                  >
                    {submitting ? "Inscribiendo..." : "Guardar Ficha"}
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
