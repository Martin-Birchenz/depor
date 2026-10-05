export default function Contacto() {
  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container text-center mb-5">
        <h1 className="section-title mb-2">Contacto y Ubicación</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "650px" }}>
          Acercate a la sede social o comunicate con la secretaría del club para
          consultas sobre cuotas, turnos y disciplinas.
        </p>
      </div>

      <div className="container" style={{ maxWidth: "950px" }}>
        <div className="row g-4">
          {/* Tarjeta de Información */}
          <div className="col-12 col-md-5">
            <div className="card h-100 bg-black text-white p-4 border-0 shadow">
              <h3 className="socios-title mb-4 border-bottom border-secondary pb-2">
                Sede Social
              </h3>
              <ul className="list-unstyled d-flex flex-column gap-3 small">
                <li>
                  <strong className="text-white">📍 Dirección:</strong>
                  <br />
                  Mihura y Fritz Gerald, Nogoyá, Entre Ríos.
                </li>
                <li>
                  <strong className="text-white">
                    ⏰ Horario de Secretaría:
                  </strong>
                  <br />
                  Lunes a Viernes de 08:30 a 12:30 y de 16:30 a 20:30.
                  <br />
                  Sábados de 09:00 a 13:00.
                </li>
                <li>
                  <strong className="text-white">
                    📞 Teléfono / WhatsApp:
                  </strong>
                  <br />
                  +54 9 3435 000000
                </li>
                <li>
                  <strong className="text-white">✉️ Email Oficial:</strong>
                  <br />
                  contacto@deportivonogoya.com.ar
                </li>
              </ul>
              <div className="mt-auto pt-3 border-top border-secondary">
                <a
                  href="https://wa.me/5493435000000?text=Hola!%20Quería%20hacer%20una%20consulta%20sobre%20el%20club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light w-100 py-2 btn-socio"
                >
                  Escribinos al WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-7">
            <div className="card h-100 bg-white p-4 border-0 shadow-sm d-flex flex-column">
              <h4 className="fw-bold mb-3">¿Cómo llegar?</h4>
              <p className="text-muted small mb-3">
                Nuestro predio se encuentra en el tradicional Barrio Lourdes,
                con accesos directos y espacio de estacionamiento para socios y
                visitantes.
              </p>
              <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm flex-grow-1">
                <iframe
                  title="Ubicación Club Deportivo Nogoyá"
                  src="https://maps.google.com/maps?q=Mihura%20y%20Fritz%20Gerald,%20Nogoy%C3%A1,%20Entre%20R%C3%ADos&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  loading="lazy"
                  style={{ border: 0 }}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
