import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PhoneForm from "../components/PhoneForm";
import BarbershopList from "../components/BarbershopList";
import Dashboard from "../components/Dashboard";
import InfoModal from "../components/InfoModal";
import PhotosModal from "../components/PhotosModal";
import { barbershops, initialAppointment } from "../data/mockData";

let nextId = 2;

export default function ClientPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const preselected = slug ? barbershops.find((b) => b.slug === slug) : null;

  const [step, setStep] = useState(preselected ? "phone" : "barbershop");
  const [userName] = useState("Gustavo Galeno");
  const [userPhone, setUserPhone] = useState("");
  const [barbershop, setBarbershop] = useState(preselected || null);
  const [activeTab, setActiveTab] = useState("new");
  const [appointments, setAppointments] = useState([initialAppointment]);
  const [showInfo, setShowInfo] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  function handleLogin(phone) {
    setUserPhone(phone);
    if (preselected) {
      setStep("dashboard");
    } else {
      setStep("barbershop");
    }
  }

  function handleSelectBarbershop(b) {
    setBarbershop(b);
    setStep("dashboard");
  }

  function handleAppointmentCreated(data) {
    setAppointments((prev) => [
      ...prev,
      { id: nextId++, barbershopId: barbershop?.id, ...data, rating: null },
    ]);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white bg-noise">
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="app-container min-h-screen sm:min-h-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/[0.03] via-transparent to-transparent pointer-events-none" />
        <Header
          onOpenInfo={() => setShowInfo(true)}
          onOpenPhotos={() => setShowPhotos(true)}
          barbershop={barbershop}
        />

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PhoneForm onLogin={handleLogin} />
            </motion.div>
          ) : step === "barbershop" ? (
            <motion.div
              key="barbershop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1"
            >
              <BarbershopList onSelect={handleSelectBarbershop} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1"
            >
                <Dashboard
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  appointments={appointments}
                  onAppointmentCreated={handleAppointmentCreated}
                  userName={userName}
                  userPhone={userPhone}
                  barbershop={barbershop}
                  onBackToBarbershops={() => setStep(preselected ? "phone" : "barbershop")}
                  hideBack={!!preselected}
                />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InfoModal open={showInfo} onClose={() => setShowInfo(false)} barbershop={barbershop} />
      <PhotosModal open={showPhotos} onClose={() => setShowPhotos(false)} barbershop={barbershop} />
    </div>
  );
}
