import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, User, Lock, Scissors, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProfessionals, getBarbershops } from "../services/supabase";

export default function LoginPage() {
  const { loginAdmin, loginBarber } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [professionals, setProfessionals] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [error, setError] = useState("");
  const [allBarbershops, setAllBarbershops] = useState([]);

  useEffect(() => {
    getBarbershops()
      .then(data => setAllBarbershops(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      setLoadingProfessionals(true);
      setSelectedProfessional("");
      getProfessionals(selectedSlug)
        .then(data => {
          setProfessionals(data || []);
          setLoadingProfessionals(false);
        })
        .catch(() => {
          setProfessionals([]);
          setLoadingProfessionals(false);
        });
    } else {
      setProfessionals([]);
    }
  }, [selectedSlug]);

  function handleAdminLogin(e) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Preencha todos os campos");
      return;
    }
    if (loginAdmin(username, password)) {
      navigate("/admin");
    } else {
      setError("Usuário ou senha inválidos");
    }
  }

  function handleBarberLogin(e) {
    e.preventDefault();
    setError("");
    if (!selectedSlug) {
      setError("Selecione uma barbearia");
      return;
    }
    if (!selectedProfessional) {
      setError("Selecione seu nome");
      return;
    }
    loginBarber(selectedSlug, selectedProfessional);
    navigate(`/barber/${selectedSlug}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white bg-noise flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
            <Scissors size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gradient-white">Agendafy</h1>
          <p className="text-zinc-500 text-sm mt-1">Faça login para continuar</p>
        </div>

        <div className="card-glass rounded-2xl overflow-hidden">
          <div className="flex border-b border-zinc-700/40">
            <button
              onClick={() => { setTab("admin"); setError(""); }}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${
                tab === "admin"
                  ? "text-white bg-zinc-800/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => { setTab("barber"); setError(""); }}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${
                tab === "barber"
                  ? "text-white bg-zinc-800/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Barbeiro
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {tab === "admin" ? (
                <motion.form
                  key="admin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleAdminLogin}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Usuário</p>
                    <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 transition-all duration-300 focus-within:border-blue-500/60 focus-within:bg-zinc-800/60">
                      <User size={14} className="text-zinc-500 shrink-0" />
                      <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="admin"
                        className="bg-transparent text-white text-sm w-full outline-none placeholder:text-zinc-600"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Senha</p>
                    <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 transition-all duration-300 focus-within:border-blue-500/60 focus-within:bg-zinc-800/60">
                      <Lock size={14} className="text-zinc-500 shrink-0" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="bg-transparent text-white text-sm w-full outline-none placeholder:text-zinc-600"
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                  >
                    <LogIn size={16} /> Entrar
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="barber"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleBarberLogin}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Barbearia</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {allBarbershops.length === 0 ? (
                        <p className="text-zinc-600 text-xs text-center py-4">Nenhuma barbearia encontrada</p>
                      ) : (
                        allBarbershops.map(b => {
                          const isSelected = selectedSlug === b.slug;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => { setSelectedSlug(b.slug); setSelectedProfessional(""); }}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all duration-200 text-left ${
                                isSelected
                                  ? "bg-blue-600/15 border-blue-500 shadow-sm shadow-blue-600/10"
                                  : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-500/60"
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                                isSelected
                                  ? "bg-gradient-to-br from-blue-600 to-blue-500"
                                  : "bg-gradient-to-br from-zinc-600 to-zinc-700"
                              }`}>
                                {b.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isSelected ? "text-blue-300" : "text-white"}`}>
                                  {b.name}
                                </p>
                                <p className="text-zinc-500 text-xs truncate">{b.address || b.slug}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-600"
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {selectedSlug && (
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Seu nome</p>
                      {loadingProfessionals ? (
                        <div className="flex items-center justify-center py-6 text-zinc-400 text-sm">
                          <Loader2 size={16} className="animate-spin mr-2" /> Carregando...
                        </div>
                      ) : professionals.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-zinc-500 text-sm">Nenhum profissional encontrado</p>
                          <p className="text-zinc-600 text-xs mt-1">Peça ao admin para cadastrar os barbeiros</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {professionals.map(p => {
                            const isSelected = selectedProfessional === p.name;
                            return (
                              <button
                                key={p.id || p.name}
                                type="button"
                                onClick={() => setSelectedProfessional(p.name)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all duration-200 text-left ${
                                  isSelected
                                    ? "bg-blue-600/15 border-blue-500 shadow-sm shadow-blue-600/10"
                                    : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-500/60"
                                }`}
                              >
                                {p.avatar ? (
                                  <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {p.name[0]}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${isSelected ? "text-blue-300" : "text-white"}`}>
                                    {p.name}
                                  </p>
                                  <p className="text-zinc-500 text-xs">{p.title || "Barbeiro"}</p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-600"
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                  >
                    <LogIn size={16} /> Entrar
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Cliente? <a href="/" className="text-blue-400 hover:underline">Faça seu agendamento</a>
        </p>
      </motion.div>
    </div>
  );
}
