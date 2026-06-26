import { motion } from "framer-motion";
import { User } from "lucide-react";
import { professionals } from "../data/mockData";

export default function Step1Professional({ selected, onSelect }) {
  return (
    <div className="flex flex-col flex-1">
      <div className="px-5 pb-4">
        <h3 className="text-white text-lg font-bold">Escolha o profissional</h3>
        <p className="text-zinc-500 text-sm mt-0.5">
          Selecione quem você prefere atender
        </p>
      </div>

      <div className="flex-1 px-5 space-y-3">
        {professionals.map((p, idx) => {
          const isSelected = selected?.id === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(p)}
              type="button"
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? "step-card-active"
                  : "step-card-inactive"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/30"
                    : "bg-zinc-700/60"
                }`}
              >
                <User
                  size={22}
                  className={isSelected ? "text-white" : "text-zinc-400"}
                />
              </div>
              <div className="text-left flex-1">
                <p
                  className={`font-semibold text-base ${
                    isSelected ? "text-blue-300" : "text-white"
                  }`}
                >
                  {p.name}
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">{p.title}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? "border-blue-500 bg-blue-600 shadow-sm shadow-blue-600/40"
                    : "border-zinc-600"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
