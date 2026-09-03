import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BookingsPage from "./pages/BookingsPage";
import TripsPage from "./pages/admin/TripsPage";
import VehiclesPage from "./pages/admin/VehiclesPage";
import DriversPage from "./pages/admin/DriversPage";
import RoutesPage from "./pages/admin/RoutesPage";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/bookings" element={<BookingsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
            <Route path="/admin/trips" element={<TripsPage />} />
            <Route path="/admin/vehicles" element={<VehiclesPage />} />
            <Route path="/admin/drivers" element={<DriversPage />} />
            <Route path="/admin/routes" element={<RoutesPage />} />
          </Route>
        </Routes>
      </main>
    </AuthProvider>
  );
}

export default App;
