import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Globe, Clock, ChevronRight, MessageCircle } from "lucide-react";
import { barbershopInfo } from "../data/mockData";

export default function InfoModal({ open, onClose, barbershop }) {
  const info = barbershop || info;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="w-full max-w-xl bg-gradient-to-b from-zinc-900/98 to-zinc-950/98 backdrop-blur-xl border border-zinc-800/80 rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10 flex items-center justify-between p-5 border-b border-zinc-800/60">
              <h3 className="text-white font-bold text-base">Informações</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 flex items-start gap-3 hover:bg-zinc-800/40 hover:border-zinc-600/60 transition-all duration-200 card-glass-hover">
                <div className="p-2 rounded-lg bg-blue-600/15 shrink-0">
                  <MapPin className="text-blue-400" size={16} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Endereço</p>
                  <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                    {info.address}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-800/40 hover:border-zinc-600/60 transition-all duration-200 card-glass-hover">
                <div className="p-2 rounded-lg bg-blue-600/15 shrink-0">
                  <Phone className="text-blue-400" size={16} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Telefone</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{info.phone}</p>
                </div>
              </div>

              <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-800/40 hover:border-zinc-600/60 transition-all duration-200 card-glass-hover">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 shrink-0">
                  <Globe className="text-purple-400" size={16} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Instagram</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{info.instagram}</p>
                </div>
              </div>

              <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800/40 hover:border-zinc-600/60 transition-all duration-200 card-glass-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-600/15 shrink-0">
                    <Clock className="text-blue-400" size={16} />
                  </div>
                  <p className="text-white text-sm font-semibold">Horários de Funcionamento</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-zinc-800/40 rounded-lg px-3 py-2.5 border border-zinc-700/30">
                    <span className="text-zinc-300 text-sm">Segunda a Sábado</span>
                    <span className="text-white font-bold text-sm">08:00 - 23:00</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-800/40 rounded-lg px-3 py-2.5 border border-zinc-700/30">
                    <span className="text-zinc-300 text-sm">Domingo</span>
                    <span className="text-red-400 font-bold text-sm">Fechado</span>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/55${info.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-gradient-to-r from-green-600/15 to-green-600/5 border border-green-600/30 rounded-xl p-4 hover:from-green-600/25 hover:to-green-600/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-600/20">
                    <MessageCircle className="text-green-400" size={16} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Fale conosco</p>
                    <p className="text-green-400 text-xs">Enviar mensagem no WhatsApp</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-green-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
