export default function ProductCard({ product, onSelectDetail }) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div
        className="card h-100 overflow-hidden product-card"
        onClick={() => onSelectDetail && onSelectDetail(product)}
      >
        <div className="product-image-wrapper">
          <img src={product.image_url} alt={product.name} />
        </div>

        <div className="card-body p-4 d-flex flex-column">
          <h5 className="fw-bold mb-1">{product.name}</h5>
          <p className="text-muted small mb-3 flex-grow-1 text-truncate">
            {product.description}
          </p>

          <div className="d-flex justify-content-between align-items-baseline mb-3">
            <span className="text-muted small">
              General: ${Number(product.price).toLocaleString("es-AR")}
            </span>
            {product.member_price && (
              <span className="fw-bold text-success">
                Socio: ${Number(product.member_price).toLocaleString("es-AR")}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-outline-dark btn-sm w-100 fw-bold"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDetail && onSelectDetail(product);
            }}
          >
            Ver detalle y talles
          </button>
        </div>
      </div>
    </div>
  );
}
