import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ClientPage from "./pages/ClientPage";
import AdminPage from "./pages/AdminPage";
import BarberPage from "./pages/BarberPage";

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
          <Route path="/" element={<ClientPage />} />
          <Route path="/b/:slug" element={<ClientPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/barber/:slug" element={<BarberPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
