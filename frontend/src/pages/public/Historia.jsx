import paredon from "../../assets/paredon-deportivo.jpg";

export default function Historia() {
  const milestones = [
    {
      year: "Orígenes",
      title: "El nacimiento en el Barrio Lourdes",
      desc: "Fundado por vecinos y deportistas con la convicción de crear un espacio de contención, encuentro y competencia para toda la comunidad nogoyaense.",
    },
    {
      year: "Crecimiento",
      title: "Obras y expansión de la sede",
      desc: "La adquisición y acondicionamiento del predio en Mihura y Fritz Gerald permitió la construcción de las canchas de tenis, la cancha de pelota paleta y el natatorio.",
    },
    {
      year: "Identidad",
      title: "La camiseta y los colores",
      desc: "El blanco y negro distintivo se convirtió en el emblema deportivo que representó a la ciudad en torneos locales, provinciales y regionales.",
    },
    {
      year: "Presente",
      title: "Un club social y polideportivo",
      desc: "Hoy El Depor reúne disciplinas formativas, torneos de fin de semana, colonia de verano y una masa societaria activa que sigue transformando las instalaciones.",
    },
  ];

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container text-center mb-5">
        <h1 className="section-title mb-2">Nuestra Historia</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
          Más de un siglo de identidad, deporte y compromiso social en Nogoyá.
        </p>
      </div>

      <div className="container mb-5" style={{ maxWidth: "950px" }}>
        <div className="card border-0 shadow-sm overflow-hidden mb-5">
          <div className="row g-0 align-items-center">
            <div className="col-lg-6">
              <img
                src={paredon}
                alt="Historia y pasión del Club Deportivo Nogoyá"
                className="img-fluid w-100 h-100 object-fit-cover grayscale"
                style={{ minHeight: "320px" }}
              />
            </div>
            <div className="col-lg-6 p-4 p-md-5 bg-white">
              <h3 className="socios-title mb-3">
                El Corazón del Barrio Lourdes
              </h3>
              <p className="text-muted small leading-relaxed">
                El Club Deportivo Nogoyá no es solo una institución deportiva;
                es el punto de encuentro de generaciones de familias. Desde los
                primeros picados de fútbol barriales hasta la consolidación de
                un predio polideportivo completo, el club creció gracias al
                trabajo desinteresado de comisiones directivas, socios y
                vecinos.
              </p>
              <p className="text-muted small leading-relaxed mb-0">
                Cada tribuna, cada cancha y cada rincón de la sede social lleva
                la huella del esfuerzo colectivo y el orgullo por la camiseta
                albinegra.
              </p>
            </div>
          </div>
        </div>

        <h3 className="section-title text-center mb-4">Hitos Fundamentales</h3>
        <div className="row g-4">
          {milestones.map((item, idx) => (
            <div key={idx} className="col-12 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm bg-white">
                <span className="badge bg-black text-white w-auto align-self-start px-3 py-2 mb-2 font-monospace">
                  {item.year}
                </span>
                <h5 className="fw-bold mt-2 mb-2">{item.title}</h5>
                <p className="text-muted small mb-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
