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
import AdminIndumentaria from "./pages/admin/AdminIndumentaria.jsx";
import AdminCantina from "./pages/admin/AdminCantina.jsx";
import AdminInfantiles from "./pages/admin/AdminInfantiles.jsx";
import AdminTenis from "./pages/admin/AdminTenis.jsx";
import AdminPadel from "./pages/admin/AdminPadel.jsx";
import AdminPelotaPaleta from "./pages/admin/AdminPelotaPaleta.jsx";
import AdminSalon from "./pages/admin/AdminSalon.jsx";

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
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["adminBirchenz", "secretaria"]}
                  />
                }
              >
                <Route path="/admin" element={<Dashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["secretaria"]} />}>
                <Route path="/admin/socios" element={<AdminSocios />} />
                <Route path="/admin/colonia" element={<AdminColonia />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["tenis"]} />}>
                <Route path="/admin/tenis" element={<AdminTenis />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["padel"]} />}>
                <Route path="/admin/padel" element={<AdminPadel />} />
              </Route>

              <Route
                element={<ProtectedRoute allowedRoles={["pelota_paleta"]} />}
              >
                <Route
                  path="/admin/pelota-paleta"
                  element={<AdminPelotaPaleta />}
                />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["salon"]} />}>
                <Route path="/admin/salon" element={<AdminSalon />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["tienda"]} />}>
                <Route
                  path="/admin/indumentaria"
                  element={<AdminIndumentaria />}
                />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["cantina"]} />}>
                <Route path="/admin/cantina" element={<AdminCantina />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["juveniles"]} />}>
                <Route path="/admin/infantiles" element={<AdminInfantiles />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
