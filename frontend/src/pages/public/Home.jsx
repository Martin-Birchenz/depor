import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../service/product.service.js";
import ProductCard from "../../components/common/ProductCard";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await getProducts();
        // Tomamos los primeros 2 o 3 productos para la portada
        setFeaturedProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Error al cargar productos en portada:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchHomeProducts();
  }, []);

  return (
    <div>
      <header className="hero-section">
        <div className="container text-center text-white px-3">
          <h1 className="display-2 fw-bold tracking-tight">
            CLUB DEPORTIVO NOGOYÁ
          </h1>
          <p className="lead fs-2 mb-4">
            El orgullo del Barrio Lourdes desde 1944.
          </p>
          <Link to="/socios" className="btn btn-outline-light fs-5 px-4 py-2">
            Hacete Socio Hoy
          </Link>
        </div>
      </header>

      <section className="py-5 bg-grey">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-6">
              <h2 className="section-title text-start mb-3">
                Nuestra Historia
              </h2>
              <p className="fs-5 text-dark lh-base">
                Desde el 16 de diciembre de 1944, el Depor es el latido del
                Barrio Lourdes. Nacido de la unión histórica entre el Nogoyá
                Lawn Tenis Club y la Sociedad Sportiva, forjado por vecinos y
                para vecinos con la pasión por el deporte y la pertenencia.
              </p>
              <Link to="/historia" className="btn btn-outline-dark mt-2">
                Conocé nuestras raíces
              </Link>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="/hinchada-cdn.jpg"
                alt="Historia del Club Deportivo Nogoyá"
                className="img-fluid rounded shadow grayscale"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/600x400/222/fff?text=Historia+El+Depor";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="section-title">Deportes en el Club</h2>
          <div className="row g-4 mt-2">
            {[
              { name: "Fútbol", img: "/futbol-cdn.jpg" },
              { name: "Tenis", img: "/tenis-cdn.jpg" },
              { name: "Pádel", img: "/padel-cdn.jpg" },
              { name: "Pelota Paleta", img: "/pelota-paleta-cdn.webp" },
              { name: "Natación y Colonia", img: "/natacion-cdn.jpeg" },
              { name: "Fútbol 5", img: "/futbol-f5-cdn.png" },
            ].map((sport, index) => (
              <div key={index} className="col-6 col-md-4">
                <div className="sport-card p-3 bg-white shadow-sm grayscale">
                  <img
                    src={sport.img}
                    alt={sport.name}
                    className="img-fluid rounded mb-2"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/400x250/111/fff?text=${sport.name}`;
                    }}
                  />
                  <h5 className="fw-bold mt-2 mb-0">{sport.name}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-black text-white text-center">
        <div className="container py-3">
          <h2 className="display-5 fw-bold mb-3">
            Formá parte de la familia del Depor
          </h2>
          <p
            className="lead mb-4 text-white-50 mx-auto"
            style={{ maxWidth: "650px" }}
          >
            Tu cuota nos ayuda a seguir manteniendo las instalaciones y
            creciendo día a día. Disfrutá de descuentos en turnos y beneficios
            exclusivos.
          </p>
          <Link to="/socios" className="btn btn-outline-light btn-lg px-4">
            ¡Quiero ser Socio!
          </Link>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="section-title">Indumentaria Oficial</h2>

          {loadingProducts ? (
            <div className="text-center py-5">
              <div className="spinner-border text-dark" role="status">
                <span className="visually-hidden">Cargando catálogo...</span>
              </div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="row g-4 justify-content-center">
              {featuredProducts.map((product) => (
                <ProductCard key={product.idproducts} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">
              Próximamente nueva indumentaria disponible en tienda.
            </p>
          )}

          <div className="text-center mt-5">
            <Link to="/indumentaria" className="btn btn-outline-dark btn-lg">
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      <section className="py-5 bg-grey">
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <div
            className="accordion accordion-flush shadow-sm bg-white rounded"
            id="accordionFAQ"
          >
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed fw-bold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq1"
                >
                  ¿Cómo reservo una cancha para jugar?
                </button>
              </h2>
              <div
                id="faq1"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFAQ"
              >
                <div className="accordion-body text-secondary">
                  Las reservas de canchas de Tenis, Pádel, Pelota Paleta y
                  Fútbol 5 se coordinan directamente por WhatsApp con el
                  encargado del club.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed fw-bold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq2"
                >
                  ¿Cómo me asocio al club?
                </button>
              </h2>
              <div
                id="faq2"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFAQ"
              >
                <div className="accordion-body text-secondary">
                  Podés acercarte a la secretaría del club con tu DNI o
                  completar la solicitud a través de esta plataforma web para
                  iniciar el trámite.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed fw-bold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq3"
                >
                  ¿Hay descuentos para socios en turnos?
                </button>
              </h2>
              <div
                id="faq3"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFAQ"
              >
                <div className="accordion-body text-secondary">
                  Sí, al momento de registrar el turno el personal aplica la
                  tarifa con descuento para socios activos con cuota al día.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
