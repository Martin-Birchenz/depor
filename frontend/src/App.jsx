import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/public/Home";
import Indumentaria from "./pages/public/Indumentaria";

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/indumentaria" element={<Indumentaria />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
