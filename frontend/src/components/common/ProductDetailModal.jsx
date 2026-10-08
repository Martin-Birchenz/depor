import { useState } from "react";

export default function ProductDetailModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState(null);

  if (!product) return null;

  const variants = product.variants || [];

  const handleBuyWhatsApp = () => {
    const sizeText = selectedSize ? ` en talle *${selectedSize}*` : "";
    const text = encodeURIComponent(
      `¡Hola! Estoy interesado en adquirir la prenda oficial *${product.name}*${sizeText} (Precio Socio: $${Number(
        product.member_price || product.price,
      ).toLocaleString("es-AR")}) que vi en la web del club.`,
    );
    window.open(`https://wa.me/5493435000000?text=${text}`, "_blank");
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg overflow-hidden">
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4 p-md-5 pt-2">
            <div className="row g-4 align-items-center">
              <div className="col-12 col-md-6">
                <div
                  className="rounded bg-light border p-3 d-flex align-items-center justify-content-center"
                  style={{ height: "380px" }}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="img-fluid h-100 object-fit-contain"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6 d-flex flex-column">
                <span className="badge bg-black text-white w-auto align-self-start mb-2 font-monospace">
                  Indumentaria Oficial
                </span>
                <h3 className="fw-bold mb-2">{product.name}</h3>
                <p className="text-muted small mb-3">{product.description}</p>

                <div className="bg-light p-3 rounded mb-3 border">
                  <div className="d-flex justify-content-between align-items-baseline">
                    <span className="text-muted small">Precio General:</span>
                    <span className="fw-bold fs-5 text-secondary">
                      ${Number(product.price).toLocaleString("es-AR")}
                    </span>
                  </div>
                  {product.member_price && (
                    <div className="d-flex justify-content-between align-items-baseline mt-1">
                      <span className="badge bg-dark text-white">
                        Precio Socio Activo
                      </span>
                      <span className="fw-bold text-success fs-4">
                        ${Number(product.member_price).toLocaleString("es-AR")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase text-secondary d-block">
                    Talles Disponibles
                  </label>
                  {variants.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const inStock = Number(v.stock) > 0;
                        const isSelected = selectedSize === v.size;

                        return (
                          <button
                            key={v.idproducts_variants}
                            type="button"
                            disabled={!inStock}
                            className={`btn btn-sm px-3 py-1 ${
                              !inStock
                                ? "btn-light text-muted border text-decoration-line-through"
                                : isSelected
                                  ? "btn-dark"
                                  : "btn-outline-dark"
                            }`}
                            onClick={() => setSelectedSize(v.size)}
                          >
                            {v.size} {!inStock && "(Sin stock)"}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-muted small">
                      Consultar talles en secretaría
                    </span>
                  )}
                </div>

                <div className="mt-auto d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-dark py-2 fw-bold btn-socio"
                    onClick={handleBuyWhatsApp}
                  >
                    Encargar por WhatsApp{" "}
                    {selectedSize ? `(Talle ${selectedSize})` : ""}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm py-2"
                    onClick={onClose}
                  >
                    Volver al catálogo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
