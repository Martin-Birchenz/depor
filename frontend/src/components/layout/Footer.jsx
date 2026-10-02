export default function Footer() {
  return (
    <footer className="py-5 bg-black text-white border-top border-dark">
      <div className="container">
        <div className="row g-4 text-start">
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">DEPORTIVO NOGOYÁ</h5>
            <p className="small text-white-50">
              El orgullo del Barrio Lourdes desde 1944. Un club, una familia,
              una pasión.
            </p>
          </div>

          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Ubicación</h5>
            <div style={{ borderRadius: "4px", overflow: "hidden" }}>
              <iframe
                title="Ubicación Club Deportivo Nogoyá"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1915.293169283138!2d-59.79037416440854!3d-32.39098173442697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b1359efe65c869%3A0xfa8b89870acf9cbb!2sClub%20Deportivo%20Nogoy%C3%A1%20(CDN)!5e1!3m2!1ses-419!2sar!4v1770046432963!5m2!1ses-419!2sar"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Contacto</h5>
            <ul className="list-unstyled small text-white-50 mb-0">
              <li className="mb-2">
                📍 Mihura y Fritz Gerald, Nogoyá, Entre Ríos.
              </li>
              <li className="mb-2">📞 +54 3435 000000</li>
              <li>✉️ contacto@depornogoya.com</li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary" />
        <p className="text-center small text-white-50 mb-0">
          © 2026 Club Deportivo Nogoyá. Desarrollado por un hincha.
        </p>
      </div>
    </footer>
  );
}
