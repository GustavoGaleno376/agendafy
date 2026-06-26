import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, User, Star, ThumbsUp, MessageSquareText, Send, Wallet, TrendingUp, Hash, XCircle } from "lucide-react";
import { formatCurrency } from "../utils/helpers";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function StarInput({ value, onChange, label }) {
  return (
    <div>
      <p className="text-zinc-400 text-xs mb-1.5 font-medium">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-all duration-150 hover:scale-110 active:scale-95"
          >
            <Star
              size={20}
              className={
                star <= value
                  ? "fill-yellow-500 text-yellow-500 drop-shadow-sm"
                  : "text-zinc-600 hover:text-zinc-400"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MyAppointments({ appointments }) {
  const stats = {
    totalSpent: appointments.reduce((s, a) => s + a.total, 0),
    avgSpent: appointments.length
      ? Math.round(appointments.reduce((s, a) => s + a.total, 0) / appointments.length)
      : 0,
    totalVisits: appointments.length,
    cancellations: appointments.filter((a) => a.status === "Cancelado").length,
  };

  const statCards = [
    { label: "Total Gasto", value: formatCurrency(stats.totalSpent), icon: Wallet, color: "from-blue-500 to-blue-600" },
    { label: "Média", value: formatCurrency(stats.avgSpent), icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
    { label: "Visitas", value: stats.totalVisits, icon: Hash, color: "from-violet-500 to-violet-600" },
    { label: "Cancel.", value: stats.cancellations, icon: XCircle, color: "from-red-500 to-red-600" },
  ];

  const [satisfaction, setSatisfaction] = useState(0);
  const [service, setService] = useState(0);
  const [ambience, setAmbience] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmitReview(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4 pb-8">
      <div className="grid grid-cols-4 gap-2">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-3 text-center hover:border-zinc-600/60 transition-all duration-200"
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-1.5 shadow-sm`}>
                <Icon size={13} className="text-white" />
              </div>
              <p className="text-white text-sm font-bold">{s.value}</p>
              <p className="text-zinc-500 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <h4 className="text-white text-sm font-bold mt-1 flex items-center gap-2">
        <CalendarDays size={14} className="text-blue-400" />
        Histórico
      </h4>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-zinc-500">
          <CalendarDays size={28} className="opacity-40 mb-2" />
          <p className="text-sm">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {appointments.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800/40 hover:border-zinc-600/60 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {a.services.join(" · ")}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-zinc-400 text-xs flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={11} />
                      {formatDate(a.date)}
                    </span>
                    <span className="text-zinc-600">|</span>
                    <span>{a.time}</span>
                    <span className="text-zinc-600">|</span>
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {a.professional.name}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-white font-bold text-sm">{formatCurrency(a.total)}</p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                      a.status === "Concluído"
                        ? "bg-green-600/15 text-green-400 border border-green-600/30"
                        : a.status === "Agendado"
                        ? "bg-blue-600/15 text-blue-400 border border-blue-600/30"
                        : "bg-red-600/15 text-red-400 border border-red-600/30"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-2 bg-gradient-to-b from-zinc-800/30 to-zinc-800/10 border border-zinc-700/50 rounded-xl p-5"
      >
        <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
          <ThumbsUp size={14} className="text-blue-400" />
          Avalie seu atendimento
        </h4>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6"
          >
            <div className="success-circle w-14 h-14 rounded-full flex items-center justify-center mb-3">
              <Send className="text-white" size={22} />
            </div>
            <p className="text-green-400 text-sm font-bold">Avaliação enviada!</p>
            <p className="text-zinc-500 text-xs mt-1">Obrigado pelo seu feedback</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-3.5">
            <StarInput value={satisfaction} onChange={setSatisfaction} label="Satisfação" />
            <StarInput value={service} onChange={setService} label="Atendimento" />
            <StarInput value={ambience} onChange={setAmbience} label="Ambiente" />
            <div className="relative">
              <MessageSquareText className="absolute left-3 top-3 text-zinc-500" size={14} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deixe um comentário (opcional)"
                rows={3}
                className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-lg py-2.5 pl-9 pr-3 text-white text-sm placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-blue-600/60 focus:bg-zinc-800/60 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
            >
              <Send size={14} />
              Enviar Avaliação
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
