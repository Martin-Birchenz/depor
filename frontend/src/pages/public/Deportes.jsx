import futbolImg from "../../assets/futbol-cdn.jpg";
import tenisImg from "../../assets/tenis-cdn.jpg";
import padelImg from "../../assets/padel-cdn.jpg";
import pelotaPaletaImg from "../../assets/pelota-paleta-cdn.webp";
import natacionImg from "../../assets/natacion-cdn.jpeg";
import bochasImg from "../../assets/bochas-cdn.jpeg";
import futbolF5Img from "../../assets/futbol-f5-cdn.png";

export default function Deportes() {
  const sports = [
    {
      name: "Fútbol",
      img: futbolImg,
      desc: "Escuela formativa de infantiles, juveniles y primera división. Competencia en Liga Departamental de Fútbol de Nogoyá.",
      categories: "Infantiles, Sub-15, Sub-17, Reserva y Primera",
    },
    {
      name: "Tenis",
      img: tenisImg,
      desc: "Canchas de polvo de ladrillo iluminadas. Clases individuales, grupales y torneos de fin de semana.",
      categories: "Iniciación, Intermedio y Competencia",
    },
    {
      name: "Pádel",
      img: padelImg,
      desc: "Canchas disponibles para alquiler particular y circuito de torneos internos por categorías.",
      categories: "Todas las categorías masculinas y femeninas",
    },
    {
      name: "Pelota Paleta",
      img: pelotaPaletaImg,
      desc: "El tradicional trinquete del club, referente histórico de la disciplina en la provincia de Entre Ríos.",
      categories: "Práctica libre, veteranos y primera",
    },
    {
      name: "Natación",
      img: natacionImg,
      desc: "Temporada de verano, clases de natación para todas las edades y andariveles para pileta libre.",
      categories: "Ambientación, Colonia y Adultos",
    },
    {
      name: "Bochas",
      img: bochasImg,
      desc: "Canchas reglamentarias y actividad social continua entre veteranos y aficionados.",
      categories: "Práctica libre y torneos federados",
    },
    {
      name: "Canchas de Fútbol 5",
      img: futbolF5Img,
      desc: "Canchas de césped sintético iluminadas para partidos y torneos nocturnos entre amigos.",
      categories: "Turnos por hora",
    },
  ];

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container text-center mb-5">
        <h1 className="section-title mb-2">Disciplinas Deportivas</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
          Entrená, competí y disfrutá de las instalaciones del Club Deportivo
          Nogoyá.
        </p>
      </div>

      <div className="container" style={{ maxWidth: "1100px" }}>
        <div className="row g-4">
          {sports.map((sport, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm overflow-hidden bg-white sport-card grayscale">
                <img
                  src={sport.img}
                  alt={sport.name}
                  className="card-img-top object-fit-cover"
                  style={{ height: "220px" }}
                />
                <div className="card-body p-4 d-flex flex-column">
                  <h4 className="fw-bold mb-2">{sport.name}</h4>
                  <p className="text-muted small mb-3 flex-grow-1">
                    {sport.desc}
                  </p>
                  <div className="border-top pt-2">
                    <span
                      className="text-uppercase text-secondary fw-bold"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Categorías / Modalidad:
                    </span>
                    <p className="small mb-0 text-dark fw-semibold">
                      {sport.categories}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
