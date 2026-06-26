import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { barbershopInfo } from "../data/mockData";

export default function PhotosModal({ open, onClose, barbershop }) {
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
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                Fotos
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {info.photos.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="aspect-square rounded-xl overflow-hidden border border-zinc-700/50 group cursor-pointer shadow-md shadow-black/30"
                  whileHover={{ scale: 1.03 }}
                >
                  <img
                    src={url}
                    alt={`Corte ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
