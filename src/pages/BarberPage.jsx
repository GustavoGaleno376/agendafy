import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { Calendar, TrendingUp, LogOut, CheckCircle, XCircle, Clock, Wallet, Scissors, Users } from "lucide-react";
import { barbershops } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "schedule", label: "Agenda", icon: Calendar },
  { id: "config", label: "Configurar", icon: Scissors },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const todayAppointments = [
  { time: "09:00", client: "Pedro", service: "Corte", status: "Confirmado" },
  { time: "10:30", client: "Lucas", service: "Barba", status: "Agendado" },
  { time: "14:00", client: "Gustavo", service: "Corte + Barba", status: "Agendado" },
];

export default function BarberPage() {
  const { slug } = useParams();
  const barbershop = barbershops.find((b) => b.slug === slug);

  const [activeTab, setActiveTab] = useState("dashboard");

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-lg">Barbearia não encontrada</p>
          <a href="/" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Voltar</a>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Agendamentos Hoje", value: todayAppointments.length, icon: Calendar, color: "from-blue-500 to-blue-600" },
    { label: "Confirmados", value: todayAppointments.filter(a => a.status === "Confirmado").length, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
    { label: "Esperando", value: todayAppointments.filter(a => a.status === "Agendado").length, icon: Clock, color: "from-yellow-500 to-yellow-600" },
    { label: "Faturamento Hoje", value: formatCurrency(145), icon: Wallet, color: "from-violet-500 to-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white bg-noise">
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-glow-blue">
              {barbershop.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-white">{barbershop.name}</h1>
              <p className="text-zinc-500 text-sm">Painel da barbearia</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/b/${slug}`} target="_blank" className="text-blue-400 text-xs font-medium hover:underline opacity-70 hover:opacity-100 transition-opacity">
              Link público →
            </a>
            <a href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors group">
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Sair
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-1 bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-1 mb-6">
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
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      variants={itemVariants}
                      className="card-glass rounded-xl p-4 text-center card-glass-hover card-glow relative overflow-hidden group"
                    >
                      <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-blue-600/5 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 shadow-lg relative z-10`}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <p className="text-white font-bold text-lg relative z-10">{s.value}</p>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-0.5 relative z-10">{s.label}</p>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-400" />
                  Agenda de Hoje
                </h3>
                <div className="space-y-2">
                  {todayAppointments.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 bg-zinc-800/40 rounded-xl p-3 border border-zinc-700/40 hover:bg-zinc-700/30 transition-all duration-300 group"
                    >
                      <div className="text-zinc-400 text-sm font-mono w-12 shrink-0">{a.time}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{a.client}</p>
                        <p className="text-zinc-500 text-xs">{a.service}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        a.status === "Confirmado"
                          ? "bg-green-600/15 text-green-400 border border-green-600/30"
                          : "bg-blue-600/15 text-blue-400 border border-blue-600/30"
                      }`}>{a.status}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg bg-green-600/15 hover:bg-green-600/25 text-green-400 transition-colors active:scale-90">
                          <CheckCircle size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-400 transition-colors active:scale-90">
                          <XCircle size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              variants={containerVariants}
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Users size={14} className="text-blue-400" />
                  Profissionais
                </h3>
                {["Miranda", "Carlos"].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 py-3 border-b border-zinc-700/30 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center text-white text-sm font-bold">
                      {name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{name}</p>
                      <p className="text-zinc-500 text-xs">Barbeiro</p>
                    </div>
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <CheckCircle size={10} /> Ativo
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Scissors size={14} className="text-blue-400" />
                  Serviços
                </h3>
                {["Corte - R$ 25 - 30min", "Barba - R$ 20 - 30min", "Corte + Barba - R$ 45 - 60min"].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between py-3 border-b border-zinc-700/30 last:border-0 group"
                  >
                    <span className="text-white text-sm">{s}</span>
                    <button className="text-zinc-500 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100">Remover</button>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="card-glass rounded-xl p-5 text-center py-16">
                <Calendar size={40} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 text-sm font-medium">Calendário completo em breve</p>
                <p className="text-zinc-600 text-xs mt-1">Visualize e gerencie todos os agendamentos por mês</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
