import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const formatPrice = (value) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card product-card h-100 bg-white shadow-sm border-0">
        <div className="product-image-wrapper">
          <img
            src={product.image_url || "/placeholder-camiseta.png"}
            alt={product.name}
            className="product-img"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/400x400/121212/ffffff?text=El+Depor";
            }}
          />
        </div>
        <div className="card-body d-flex flex-column text-center p-4">
          <h5 className="fw-bold mb-2">{product.name}</h5>
          {product.description && (
            <p className="text-muted small mb-3">{product.description}</p>
          )}

          <div className="mt-auto">
            <p className="fs-4 fw-bold mb-1 text-black">
              {formatPrice(product.price)}
            </p>
            {product.member_price && (
              <p className="badge bg-black text-white px-2 py-1 mb-3">
                Socios: {formatPrice(product.member_price)}
              </p>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className="d-flex justify-content-center gap-1 mb-3 flex-wrap">
                {product.variants.map((v) => (
                  <span
                    key={v.idproducts_variants}
                    className={`badge border text-dark ${v.stock > 0 ? "bg-light" : "bg-secondary text-white-50 text-decoration-line-through"}`}
                    title={v.stock > 0 ? `Stock: ${v.stock}` : "Sin stock"}
                  >
                    {v.size}
                  </span>
                ))}
              </div>
            )}

            <Link to="/indumentaria" className="btn btn-outline-dark w-100">
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
