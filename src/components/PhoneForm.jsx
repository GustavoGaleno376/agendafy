import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { formatPhone } from "../utils/helpers";

export default function PhoneForm({ onLogin }) {
  const [phone, setPhone] = useState("");

  const digits = phone.replace(/\D/g, "");
  const isValid = digits.length === 11;

  function handleSubmit(e) {
    e.preventDefault();
    if (isValid) {
      onLogin(digits);
    }
  }

  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-14 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 flex items-center justify-center mb-5 shadow-glow-blue animate-float-slow"
      >
        <Phone className="text-blue-400" size={26} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <h2 className="text-white text-xl font-bold">
          Faça seu agendamento
        </h2>
        <p className="text-zinc-500 text-sm mt-1 mb-8">
          Digite seu WhatsApp para continuar
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full max-w-xs flex flex-col items-center gap-4"
      >
        <div className="relative w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors duration-300 z-10">
            <Phone size={18} />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(XX) XXXXX-XXXX"
            className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl py-3.5 pl-11 pr-4 text-white text-base placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60 focus:shadow-[0_0_0_1px_rgba(37,99,235,0.2),0_0_20px_rgba(37,99,235,0.05)]"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
        </div>

        <motion.button
          type="submit"
          disabled={!isValid}
          whileTap={isValid ? { scale: 0.98 } : {}}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:shadow-none relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 disabled:hidden" />
          <Sparkles size={16} className="opacity-70" />
          Continuar
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-1.5 text-zinc-600 text-[10px] mt-1"
        >
          <ShieldCheck size={12} />
          <span>Seus dados estão seguros</span>
        </motion.div>
      </motion.form>
    </div>
  );
}
