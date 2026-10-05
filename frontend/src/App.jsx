import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/public/Home";
import Indumentaria from "./pages/public/Indumentaria";
import Socios from "./pages/public/Socios";
import Colonia from "./pages/public/Colonia";
import Historia from "./pages/public/Historia";
import Deportes from "./pages/public/Deportes";
import Contacto from "./pages/public/Contacto";
import Turnos from "./pages/public/Turnos";

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/indumentaria" element={<Indumentaria />} />
            <Route path="/socios" element={<Socios />} />
            <Route path="/colonia" element={<Colonia />} />
            <Route path="/historia" element={<Historia />} />
            <Route path="/deportes" element={<Deportes />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/turnos" element={<Turnos />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
