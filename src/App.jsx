import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import BarberPage from "./pages/BarberPage";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user || (role && user.role !== role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/b/:slug" element={<ClientPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barber/:slug"
            element={
              <ProtectedRoute role="barber">
                <BarberPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AnimatedRoutes />
    </AuthProvider>
  );
}
