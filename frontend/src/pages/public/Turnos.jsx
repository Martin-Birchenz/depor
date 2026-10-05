import { useEffect, useState } from "react";
import { getFacilities } from "../../service/facility.service";

export default function Turnos() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackFacilities = [
    {
      idfacilities: 1,
      name: "Cancha de Fútbol 5 Sintético",
      sport: "Fútbol 5",
      hourly_rate: 18000,
      member_hourly_rate: 13000,
      description:
        "Césped sintético e iluminación LED de última generación. Turnos de 60 minutos.",
    },
    {
      idfacilities: 2,
      name: "Canchas de Tenis (Polvo de Ladrillo)",
      sport: "Tenis",
      hourly_rate: 10000,
      member_hourly_rate: 6500,
      description:
        "Mantenimiento diario de polvo de ladrillo, flejes y red reglamentaria con iluminación nocturna.",
    },
    {
      idfacilities: 3,
      name: "Canchas de Pádel",
      sport: "Pádel",
      hourly_rate: 12000,
      member_hourly_rate: 8000,
      description:
        "Muros tradicionales, piso de cemento pulido e iluminación para turnos de 90 minutos.",
    },
    {
      idfacilities: 4,
      name: "Trinquete de Pelota Paleta",
      sport: "Pelota Paleta",
      hourly_rate: 9000,
      member_hourly_rate: 5000,
      description:
        "Trinquete histórico cerrado, piso de parquet e iluminación para partidos y desafíos.",
    },
  ];

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const data = await getFacilities();
        if (data && data.length > 0) {
          setFacilities(data);
        } else {
          setFacilities(fallbackFacilities);
        }
      } catch (error) {
        console.log(error);
        setFacilities(fallbackFacilities);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const handleBookFacility = (facility) => {
    const text = encodeURIComponent(
      `¡Hola! Quiero consultar disponibilidad y reservar un turno para: *${facility.name}* en el Club Deportivo Nogoyá.`,
    );
    window.open(`https://wa.me/5493435000000?text=${text}`, "_blank");
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container text-center mb-5">
        <h1 className="section-title mb-2">Alquiler de Canchas y Turnos</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "650px" }}>
          Consultá los aranceles por hora y reservá tu cancha en el predio del
          club. Descuentos exclusivos para socios con cuota al día.
        </p>
      </div>

      <div className="container" style={{ maxWidth: "1000px" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
            <p className="mt-2 text-muted small">
              Cargando instalaciones disponibles...
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {facilities.map((fac) => (
              <div key={fac.idfacilities} className="col-12 col-md-6">
                <div className="card h-100 p-4 border-0 shadow-sm bg-white d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h4 className="fw-bold mb-0">{fac.name}</h4>
                      <span className="badge bg-black text-white">
                        {fac.sport || "Deporte"}
                      </span>
                    </div>
                    <p className="text-muted small mb-4">{fac.description}</p>
                  </div>

                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between align-items-baseline mb-1">
                      <span className="text-muted small">Arancel General:</span>
                      <span className="fw-bold fs-5">
                        ${Number(fac.hourly_rate || 0).toLocaleString("es-AR")}{" "}
                        / h
                      </span>
                    </div>

                    {fac.member_hourly_rate && (
                      <div className="d-flex justify-content-between align-items-baseline mb-3">
                        <span className="badge bg-secondary text-white">
                          Tarifa Socio
                        </span>
                        <span className="fw-bold text-success fs-5">
                          $
                          {Number(fac.member_hourly_rate).toLocaleString(
                            "es-AR",
                          )}{" "}
                          / h
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-dark w-100 py-3 fw-bold btn-socio mt-2"
                      onClick={() => handleBookFacility(fac)}
                    >
                      Reservar Turno por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card bg-black text-white p-4 border-0 shadow mt-5 text-center">
          <h4 className="socios-title mb-2">Reglamento de Uso y Turnos</h4>
          <p
            className="text-white-50 small mb-0 mx-auto"
            style={{ maxWidth: "700px" }}
          >
            Los turnos se reservan con antelación. En caso de lluvia o fuerza
            mayor, se reprograman dentro de los 30 días posteriores. El uso de
            calzado adecuado para cada superficie es obligatorio.
          </p>
        </div>
      </div>
    </div>
  );
}
