import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, ArrowLeft, Store } from "lucide-react";
import NewAppointment from "./NewAppointment";
import MyAppointments from "./MyAppointments";

export default function Dashboard({ activeTab, setActiveTab, appointments, onAppointmentCreated, userName, userPhone, barbershop, onBackToBarbershops, hideBack }) {
  const tabs = [
    { id: "new", label: "Novo Agendamento", icon: Plus },
    { id: "my", label: "Meus Agendamentos", icon: Calendar },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        {!hideBack && (
          <button
            onClick={onBackToBarbershops}
            className="p-1.5 rounded-lg hover:bg-zinc-700/40 text-zinc-400 hover:text-white transition-all duration-200"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <p className="text-zinc-400 text-sm">
          Olá, <span className="text-white font-semibold">{userName}</span>
          {barbershop && (
            <span className="text-zinc-500 font-normal">
              {" "}· <Store size={11} className="inline text-blue-400" />{" "}
              {barbershop.name}
            </span>
          )}
        </p>
      </div>

      <div className="flex mx-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-1 gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/30"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col flex-1"
        >
          {activeTab === "new" ? (
            <NewAppointment onAppointmentCreated={onAppointmentCreated} userPhone={userPhone} userName={userName} barbershop={barbershop} />
          ) : (
            <MyAppointments appointments={appointments} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
