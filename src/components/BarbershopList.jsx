import { motion } from "framer-motion";
import { MapPin, Star, ChevronRight, Store, Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function BarbershopList({ onSelect, barbershops = [] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      barbershops.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, barbershops]
  );

  return (
    <div className="flex flex-col flex-1 px-5 pt-5 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 flex items-center justify-center mx-auto mb-3 shadow-glow-blue">
          <Store className="text-blue-400" size={24} />
        </div>
        <h2 className="text-white text-lg font-bold">Escolha a barbearia</h2>
        <p className="text-zinc-500 text-sm mt-0.5">
          Selecione onde você quer agendar
        </p>
      </motion.div>

      <div className="relative group mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar barbearia..."
          className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
        />
      </div>

      <div className="flex-1 space-y-3">
        {filtered.map((b, idx) => (
          <motion.button
            key={b.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(b)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-zinc-700/50 bg-zinc-800/20 hover:bg-zinc-800/40 hover:border-zinc-600/60 transition-all duration-300 text-left"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/20 flex items-center justify-center shrink-0 overflow-hidden">
              {b.photos?.[0] ? (
                <img src={b.photos[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="text-blue-400" size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm truncate">{b.name}</p>
                {b.verified && (
                  <div className="shrink-0 bg-blue-600/20 rounded-full p-0.5">
                    <Star size={10} className="text-blue-400 fill-blue-400" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={10} className="text-zinc-600 shrink-0" />
                <p className="text-zinc-500 text-xs truncate">{b.address}</p>
              </div>
              <p className="text-zinc-600 text-[10px] mt-0.5">{b.hours}</p>
            </div>
            <ChevronRight size={16} className="text-zinc-500 shrink-0" />
          </motion.button>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-zinc-500">
            <Store size={28} className="opacity-40 mb-2" />
            <p className="text-sm">Nenhuma barbearia encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
