import { useEffect, useState } from "react";
import { getProducts, updateProduct } from "../../service/product.service";

export default function AdminIndumentaria() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    price: "",
    memberPrice: "",
    inStock: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();
        if (isMounted) setProducts(data || []);
      } catch (err) {
        if (isMounted) console.error("Error al cargar indumentaria:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartEdit = (product) => {
    const id = product.id || product.idproducts;
    setEditingId(id);
    setEditForm({
      price: product.price,
      memberPrice: product.member_price || product.memberPrice || "",
      inStock: product.in_stock ?? product.inStock ?? true,
    });
  };

  const handleSaveEdit = async (id) => {
    setSubmitting(true);
    try {
      await updateProduct(id, {
        price: Number(editForm.price),
        memberPrice: Number(editForm.memberPrice),
        inStock: Boolean(editForm.inStock),
      });

      setProducts((prev) =>
        prev.map((p) => {
          const currentId = p.id || p.idproducts;
          if (currentId === id) {
            return {
              ...p,
              price: editForm.price,
              member_price: editForm.memberPrice,
              in_stock: editForm.inStock,
            };
          }
          return p;
        }),
      );
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error al actualizar el producto.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Tienda e Indumentaria</h2>
          <p className="text-muted small mb-0">
            Control de stock, precios generales y bonificaciones para socios de
            El Depor.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar prenda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6 text-md-end text-muted small">
            <strong>{filteredProducts.length}</strong> artículos registrados
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="ps-4">Prenda</th>
                <th>Precio General</th>
                <th>Precio Socio</th>
                <th>Estado Stock</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div
                      className="spinner-border text-dark"
                      role="status"
                    ></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No se encontraron productos en el catálogo.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const id = p.id || p.idproducts;
                  const isEditing = editingId === id;
                  const inStock = p.in_stock ?? p.inStock ?? true;

                  return (
                    <tr key={id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={p.image_url || p.imageUrl}
                            alt={p.name}
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "contain",
                            }}
                            className="rounded bg-light border p-1"
                          />
                          <div>
                            <div className="fw-bold text-dark">{p.name}</div>
                            <div
                              className="text-muted small text-truncate"
                              style={{ maxWidth: "250px" }}
                            >
                              {p.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-control form-control-sm w-75"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                price: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <span className="fw-bold">
                            ${Number(p.price).toLocaleString("es-AR")}
                          </span>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-control form-control-sm w-75"
                            value={editForm.memberPrice}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                memberPrice: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <span className="fw-bold text-success">
                            $
                            {Number(
                              p.member_price || p.memberPrice || 0,
                            ).toLocaleString("es-AR")}
                          </span>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={editForm.inStock}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  inStock: e.target.checked,
                                })
                              }
                            />
                            <label className="form-check-label small">
                              {editForm.inStock ? "Disponible" : "Sin Stock"}
                            </label>
                          </div>
                        ) : (
                          <span
                            className={`badge ${inStock ? "bg-success" : "bg-secondary"}`}
                          >
                            {inStock ? "En Stock" : "Sin Stock"}
                          </span>
                        )}
                      </td>

                      <td className="text-end pe-4">
                        {isEditing ? (
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={submitting}
                              className="btn btn-sm btn-dark fw-bold"
                              onClick={() => handleSaveEdit(id)}
                            >
                              Guardar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => handleStartEdit(p)}
                          >
                            Modificar
                          </button>
                        )}
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
  );
}
