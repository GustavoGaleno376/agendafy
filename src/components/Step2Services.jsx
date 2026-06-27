import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Check, Scissors } from "lucide-react";
import { formatCurrency } from "../utils/helpers";
import { getServicesByBarbershop } from "../services/supabase";

export default function Step2Services({ selected, onToggle, barbershopSlug }) {
  const [search, setSearch] = useState("");
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    if (barbershopSlug) {
      getServicesByBarbershop(barbershopSlug)
        .then(dbServices => {
          if (dbServices && dbServices.length > 0) {
            setAllServices(dbServices);
            const durationMap = {};
            dbServices.forEach(s => { durationMap[s.name] = s.duration; });
            localStorage.setItem("agendafy_services_map", JSON.stringify(durationMap));
          }
        })
        .catch(() => {});
    }
  }, [barbershopSlug]);

  const filtered = useMemo(
    () =>
      allServices.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, allServices]
  );

  const totalPrice = selected.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selected.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="flex flex-col flex-1">
      <div className="px-5 pb-3">
        <h3 className="text-white text-lg font-bold">Escolha os serviços</h3>
        <p className="text-zinc-400 text-sm mt-0.5">
          Selecione um ou mais serviços
        </p>
      </div>

      <div className="px-5 pb-3">
        <div className="relative group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar Serviço..."
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-blue-600 focus:bg-zinc-800 focus:shadow-lg focus:shadow-blue-600/10"
          />
        </div>
      </div>

      <div className="flex-1 px-5 space-y-2">
        {filtered.map((s, idx) => {
          const isSelected = selected.some((x) => x.id === s.id);
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(s)}
              type="button"
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-r from-blue-600/15 to-blue-600/5 border-blue-500 shadow-lg shadow-blue-600/10"
                  : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-500/80 hover:bg-zinc-800/60"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isSelected
                    ? "bg-blue-600 border-blue-500 shadow-sm shadow-blue-600/30"
                    : "border-zinc-600 bg-zinc-800/50"
                }`}
              >
                {isSelected && <Check className="text-white" size={14} />}
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`text-sm font-medium ${
                    isSelected ? "text-blue-300" : "text-white"
                  }`}
                >
                  {s.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-zinc-500 text-xs">
                    <Clock size={11} />
                    {s.duration}min
                  </span>
                </div>
              </div>
              <span
                className={`text-sm font-bold ${
                  isSelected ? "text-blue-300" : "text-zinc-300"
                }`}
              >
                {formatCurrency(s.price)}
              </span>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-zinc-500">
            <Scissors size={24} className="mb-2 opacity-50" />
            <p className="text-sm">Nenhum serviço encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
