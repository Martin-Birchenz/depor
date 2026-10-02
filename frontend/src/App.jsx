import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

function HomePlaceholder() {
  return (
    <header className="hero-section">
      <div className="container text-center text-white">
        <h1 className="display-2 fw-bold">CLUB DEPORTIVO NOGOYÁ</h1>
        <p className="lead fs-2 mb-4">
          El orgullo del Barrio Lourdes desde 1944.
        </p>
        <a href="#hacete-socio" className="btn btn-outline-light">
          Hacete Socio Hoy
        </a>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePlaceholder />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
