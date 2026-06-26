import { motion } from "framer-motion";
import { Banknote, QrCode, CreditCard, Landmark, CheckCircle } from "lucide-react";
import { paymentMethods } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

const iconMap = { Banknote, QrCode, CreditCard, Landmark };

export default function Step4Payment({ selected, onSelect, total }) {
  return (
    <div className="flex flex-col flex-1">
      <div className="px-5 pt-2 pb-4">
        <h3 className="text-white text-lg font-bold">Forma de Pagamento</h3>
        <p className="text-zinc-400 text-sm mt-0.5">
          Como você pretende pagar?
        </p>
      </div>

      <div className="flex-1 px-5">
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((m, idx) => {
            const Icon = iconMap[m.icon];
            const isSelected = selected === m.id;
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(m.id)}
                type="button"
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-b from-blue-600/15 to-blue-600/5 border-blue-500/60 shadow-xl shadow-blue-600/15"
                    : "step-card-inactive"
                }`}
              >
                <div
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30"
                      : "bg-zinc-700/80 text-zinc-400"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isSelected ? "text-blue-300" : "text-zinc-300"
                  }`}
                >
                  {m.name}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle size={16} className="text-blue-400" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 bg-gradient-to-b from-zinc-800/40 to-zinc-800/20 border border-zinc-700/60 rounded-xl p-5 text-center">
          <p className="text-zinc-400 text-xs leading-relaxed">
            O pagamento será realizado diretamente no estabelecimento
          </p>
          <div className="mt-4 pt-4 border-t border-zinc-700/50">
            <p className="text-zinc-500 text-xs tracking-wide uppercase">
              Total do agendamento
            </p>
            <p className="text-white text-3xl font-extrabold mt-1 tracking-tight">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
