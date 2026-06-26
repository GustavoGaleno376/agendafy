import { motion } from "framer-motion";

const steps = [
  { num: 1, label: "Profissional" },
  { num: 2, label: "Serviços" },
  { num: 3, label: "Data & Hora" },
  { num: 4, label: "Pagamento" },
];

export default function StepProgress({ currentStep }) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-5">
      {steps.map((s, i) => {
        const isActive = s.num === currentStep;
        const isPast = s.num < currentStep;
        return (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={
                  isActive
                    ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0 0 rgba(37,99,235,0.4)", "0 0 0 6px rgba(37,99,235,0)", "0 0 0 0 rgba(37,99,235,0.4)"] }
                    : { scale: 1 }
                }
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/40"
                    : isPast
                    ? "bg-blue-600/15 border-blue-500/50 text-blue-400 shadow-sm shadow-blue-600/10"
                    : "bg-zinc-800/60 border-zinc-600/40 text-zinc-500"
                }`}
              >
                {isPast ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{s.num}</span>
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-1.5 font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? "text-blue-400" : isPast ? "text-blue-400/60" : "text-zinc-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-3 mb-4 relative">
                <div className="h-[2px] rounded-full bg-zinc-700/50 w-full" />
                <div
                  className={`absolute top-0 left-0 h-[2px] rounded-full transition-all duration-700 ease-out ${
                    isPast
                      ? "w-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm shadow-blue-600/30"
                      : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
