import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout";

import Home from "./pages/public/Home";
import Indumentaria from "./pages/public/Indumentaria";
import Socios from "./pages/public/Socios";
import Colonia from "./pages/public/Colonia";
import Historia from "./pages/public/Historia";
import Deportes from "./pages/public/Deportes";
import Contacto from "./pages/public/Contacto";
import Turnos from "./pages/public/Turnos";

import Login from "./components/admin/Login";
import Dashboard from "./components/admin/Dashboard";
import AdminSocios from "./pages/admin/AdminSocios";
import AdminColonia from "./pages/admin/AdminColonia.jsx";
import AdminCanchas from "./pages/admin/AdminCanchas.jsx";

function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/indumentaria" element={<Indumentaria />} />
            <Route path="/socios" element={<Socios />} />
            <Route path="/colonia" element={<Colonia />} />
            <Route path="/historia" element={<Historia />} />
            <Route path="/deportes" element={<Deportes />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/turnos" element={<Turnos />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/socios" element={<AdminSocios />} />
              <Route path="/admin/colonia" element={<AdminColonia />} />
              <Route path="/admin/canchas" element={<AdminCanchas />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
