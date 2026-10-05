import { useEffect, useState } from "react";
import { getProducts } from "../../service/product.service.js";
import ProductCard from "../../components/common/ProductCard";

export default function Indumentaria() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!onlyInStock) return matchesSearch;

    const hasStock =
      product.variants && product.variants.some((v) => Number(v.stock) > 0);
    return matchesSearch && hasStock;
  });

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container text-center mb-5">
        <h1 className="section-title mb-2">Tienda Oficial</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
          Vestí los colores de El Depor. Indumentaria oficial gestionada por la
          subcomisión del club.
        </p>
      </div>

      <div className="container">
        <div className="row g-3 justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border">
          <div className="col-12 col-md-6 col-lg-5">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por prenda (ej: camiseta, short)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4 text-md-end">
            <div className="form-check form-switch d-inline-block">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="stockSwitch"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
              />
              <label
                className="form-check-label fw-bold small ms-2"
                htmlFor="stockSwitch"
              >
                Solo productos con stock
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Cargando indumentaria...</span>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="row g-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.idproducts} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-5 bg-white rounded shadow-sm border p-4 my-4">
            <p className="fs-5 text-muted mb-0">
              No se encontraron productos que coincidan con la búsqueda.
            </p>
          </div>
        )}

        <div className="alert alert-dark mt-5 text-center p-4 border-0 shadow-sm">
          <h5 className="fw-bold mb-2">¿Cómo adquirir tu indumentaria?</h5>
          <p className="mb-0 text-dark-50">
            Consultá disponibilidad o reservá tu talle directamente en la
            secretaría del club o coordinando por WhatsApp con los encargados de
            la tienda.
          </p>
        </div>
      </div>
    </div>
  );
}
