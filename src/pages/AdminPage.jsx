import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Store, LogOut, Plus, ChevronRight, Save, ExternalLink, Check, Globe, Clock, Phone, MapPin, MessageCircle, Key, Hash, Camera, ArrowLeft, Lock, Trash2, UserPlus, Loader2, AlertCircle, Upload } from "lucide-react";
import { barbershops as initialBarbershops } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { supabase, saveProfessionals, getBarbershopBySlug, getProfessionals, getBarbershops } from "../services/supabase";

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "nova-barbearia";
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

let nextId = 10;

const emptyBarbershop = {
  name: "",
  slug: "",
  address: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  hours: "",
  verified: false,
  zapiInstance: "",
  zapiToken: "",
  zapiClientToken: "",
  photos: [],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function Input({ label, value, onChange, placeholder, icon: Icon, type }) {
  return (
    <div>
      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">{label}</p>
      <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 transition-all duration-300 focus-within:border-blue-500/60 focus-within:bg-zinc-800/60">
        {Icon && <Icon size={14} className="text-zinc-500 shrink-0" />}
        <input
          type={type || "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent text-white text-sm w-full outline-none placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </motion.div>
  );
}

export default function AdminPage() {
  const { logout, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [barbershops, setBarbershops] = useState(initialBarbershops);
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBarbershop);
  const [professionalsList, setProfessionalsList] = useState([]);
  const [newProfessional, setNewProfessional] = useState("");
  const [newProfessionalTitle, setNewProfessionalTitle] = useState("");
  const [newProfessionalAvatar, setNewProfessionalAvatar] = useState("");
  const [editingProfIndex, setEditingProfIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [toast, setToast] = useState(null);

  function showToast(message, type) {
    setToast({ message, type });
  }

  useEffect(() => {
    getBarbershops()
      .then(dbList => {
        if (dbList && dbList.length > 0) {
          setBarbershops(prev => {
            const merged = [...prev];
            dbList.forEach(db => {
              if (!merged.some(b => b.slug === db.slug)) {
                merged.push({
                  id: `db-${db.slug}`,
                  name: db.name,
                  slug: db.slug,
                  address: db.address || "",
                  phone: db.phone || "",
                  whatsapp: db.whatsapp || "",
                  instagram: db.instagram || "",
                  hours: "",
                  verified: false,
                  zapiInstance: "",
                  zapiToken: "",
                  zapiClientToken: "",
                  photos: [],
                });
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleChangePassword() {
    setPasswordError("");
    setPasswordSuccess("");
    if (!passwordData.current || !passwordData.newPass) {
      setPasswordError("Preencha todos os campos");
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      setPasswordError("Nova senha e confirmação não conferem");
      return;
    }
    if (passwordData.newPass.length < 4) {
      setPasswordError("A senha deve ter no mínimo 4 caracteres");
      return;
    }
    if (updatePassword(passwordData.current, passwordData.newPass)) {
      setPasswordSuccess("Senha alterada com sucesso!");
      setPasswordData({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } else {
      setPasswordError("Senha atual incorreta");
    }
  }

  async function handleEdit(b) {
    setEditing(b.id);
    setLoadingDb(true);
    setForm({
      ...emptyBarbershop,
      id: b.id,
      name: b.name,
      slug: b.slug,
      address: b.address || "",
      phone: b.phone || "",
      whatsapp: b.whatsapp || "",
      instagram: b.instagram || "",
      hours: b.hours || "",
      verified: b.verified || false,
      photos: b.photos || [],
    });

    try {
      const [dbData, dbProfessionals] = await Promise.all([
        getBarbershopBySlug(b.slug),
        getProfessionals(b.slug).catch(() => []),
      ]);
      if (dbData) {
        setForm(prev => ({
          ...prev,
          hours: dbData.hours || prev.hours || "",
          photos: dbData.photos || prev.photos || [],
          zapiInstance: dbData.zapi_instance || "",
          zapiToken: dbData.zapi_token || "",
          zapiClientToken: dbData.zapi_client_token || "",
        }));
      }
      if (dbProfessionals && dbProfessionals.length > 0) {
        setProfessionalsList(dbProfessionals.map(p => ({
          name: p.name,
          title: p.title || "Barbeiro",
          avatar: p.avatar || null,
        })));
      }
    } catch (err) {
      console.error("Erro ao buscar dados do banco:", err);
    }

    setNewProfessional("");
    setNewProfessionalTitle("");
    setNewProfessionalAvatar("");
    setEditingProfIndex(null);
    setLoadingDb(false);
    setView("form");
  }

  function handleNew() {
    setForm({ ...emptyBarbershop, id: `b${nextId++}`, slug: "" });
    setProfessionalsList([]);
    setEditing(null);
    setView("form");
  }

  function handleAddProfessional() {
    const name = newProfessional.trim();
    if (!name) return;
    if (editingProfIndex !== null) {
      setProfessionalsList(prev => prev.map((p, i) =>
        i === editingProfIndex
          ? { name, title: newProfessionalTitle || "Barbeiro", avatar: newProfessionalAvatar || null }
          : p
      ));
      setEditingProfIndex(null);
    } else {
      setProfessionalsList(prev => [...prev, { name, title: newProfessionalTitle || "Barbeiro", avatar: newProfessionalAvatar || null }]);
    }
    setNewProfessional("");
    setNewProfessionalTitle("");
    setNewProfessionalAvatar("");
  }

  function handleRemoveProfessional(idx) {
    setProfessionalsList(prev => prev.filter((_, i) => i !== idx));
  }

  function handleEditProfessional(idx) {
    const p = professionalsList[idx];
    setNewProfessional(p.name);
    setNewProfessionalTitle(p.title || "Barbeiro");
    setNewProfessionalAvatar(p.avatar || "");
    setEditingProfIndex(idx);
  }

  function handleChange(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "name") {
        next.slug = generateSlug(value);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);

    if (editing) {
      setBarbershops(prev => prev.map(b => b.id === editing ? { ...b, ...form } : b));
    } else {
      setBarbershops(prev => [...prev, form]);
    }

    if (form.slug) {
      try {
        const { error: fnError } = await supabase.functions.invoke("save-barbershop", {
          body: {
            slug: form.slug,
            name: form.name || form.slug,
            phone: form.phone || null,
            whatsapp: form.whatsapp || null,
            address: form.address || null,
            instagram: form.instagram || null,
            hours: form.hours || null,
            photos: form.photos && form.photos.length > 0 ? form.photos : null,
            zapiInstance: form.zapiInstance || null,
            zapiToken: form.zapiToken || null,
            zapiClientToken: form.zapiClientToken || null,
          },
        });

        if (fnError) {
          showToast(`Erro ao salvar no banco: ${fnError.message}`, "error");
        } else {
          showToast("Barbearia salva com sucesso!", "success");
        }
      } catch (err) {
        showToast(`Erro ao conectar: ${err.message}`, "error");
      }

      try {
        await saveProfessionals(form.slug, professionalsList);
      } catch (e) {
        console.error("Erro ao salvar profissionais:", e);
      }
    }

    setTimeout(() => {
      setSaving(false);
      setView("list");
    }, 400);
  }

  function handleDelete(id) {
    setBarbershops(prev => prev.filter(b => b.id !== id));
    if (view === "form" && editing === id) setView("list");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white bg-noise">
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gradient-white">Painel Admin</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Gerencie todas as barbearias</p>
          </div>
          <div className="flex items-center gap-2">
            {view !== "list" && (
              <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors">
                <ArrowLeft size={14} /> Voltar
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors group">
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Sair
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-400 text-sm">{barbershops.length} barbearia{barbershops.length !== 1 ? "s" : ""}</p>
                <button onClick={handleNew} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-lg shadow-blue-600/25">
                  <Plus size={14} /> Nova Barbearia
                </button>
              </div>

              <div className="space-y-2">
                {barbershops.map((b, i) => (
                  <motion.button
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleEdit(b)}
                    className="w-full card-glass rounded-xl p-4 card-glass-hover text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-base shrink-0">
                        {getInitials(b.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm truncate">{b.name}</p>
                          {b.verified && <Check size={12} className="text-blue-400 shrink-0" />}
                        </div>
                        <p className="text-zinc-500 text-xs truncate">{b.address || "Sem endereço"}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {b.zapiToken && <MessageCircle size={10} className="text-green-400" />}
                          <span className="text-zinc-600 text-[10px]">/{b.slug}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 border-t border-zinc-800/40 pt-6">
                <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors flex items-center gap-1.5">
                  <Lock size={12} /> {showPasswordForm ? "Fechar" : "Alterar senha do admin"}
                </button>
                {showPasswordForm && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 max-w-xs space-y-3">
                    <input value={passwordData.current} onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))} placeholder="Senha atual" type="password" className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600" />
                    <input value={passwordData.newPass} onChange={e => setPasswordData(p => ({ ...p, newPass: e.target.value }))} placeholder="Nova senha" type="password" className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600" />
                    <input value={passwordData.confirm} onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirmar nova senha" type="password" className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600" />
                    {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
                    {passwordSuccess && <p className="text-green-400 text-xs">{passwordSuccess}</p>}
                    <button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">Salvar senha</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {view === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} variants={containerVariants} className="max-w-2xl mx-auto space-y-5">
              {loadingDb ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-blue-400" />
                  <span className="ml-3 text-zinc-400 text-sm">Carregando dados...</span>
                </div>
              ) : (
                <>
                  <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <Store size={14} className="text-blue-400" /> Informações da Barbearia
                    </h3>
                    <div className="space-y-3">
                      <Input label="Nome" value={form.name} onChange={v => handleChange("name", v)} placeholder="Ex: MD Barbearia" icon={Store} />
                      <div className="flex items-center gap-3 bg-zinc-800/30 rounded-xl px-4 py-3 border border-zinc-700/40">
                        <Hash size={14} className="text-zinc-500 shrink-0" />
                        <div className="flex-1">
                          <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Slug (automático)</p>
                          <p className="text-zinc-300 text-sm">/{form.slug || "..."}</p>
                        </div>
                      </div>
                      <Input label="Endereço" value={form.address} onChange={v => handleChange("address", v)} placeholder="Rua, número, bairro" icon={MapPin} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Telefone" value={form.phone} onChange={v => handleChange("phone", v)} placeholder="(11) 99999-8888" icon={Phone} />
                        <Input label="WhatsApp" value={form.whatsapp} onChange={v => handleChange("whatsapp", v)} placeholder="5511999998888" icon={MessageCircle} />
                      </div>
                      <Input label="Instagram" value={form.instagram} onChange={v => handleChange("instagram", v)} placeholder="@barbearia" icon={Globe} />
                      <Input label="Horários" value={form.hours} onChange={v => handleChange("hours", v)} placeholder="Seg a Sáb: 08:00 às 23:00" icon={Clock} />
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${form.verified ? "bg-blue-600" : "bg-zinc-700"}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${form.verified ? "translate-x-5.5" : "translate-x-0.5"}`} style={{ transform: form.verified ? "translateX(22px)" : "translateX(2px)" }} />
                        </div>
                        <span className="text-zinc-300 text-sm">Barbearia verificada</span>
                      </label>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <MessageCircle size={14} className="text-blue-400" /> Z-API (WhatsApp)
                    </h3>
                    <p className="text-zinc-500 text-xs mb-4">Configure a integração WhatsApp para esta barbearia.</p>
                    <div className="space-y-3">
                      <div className="border-t border-zinc-700/30 my-2" />
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Credenciais da Z-API</p>
                      <Input label="ID da instância" value={form.zapiInstance} onChange={v => handleChange("zapiInstance", v)} placeholder="3A4B5C6D" icon={Hash} />
                      <Input label="Token da instância" value={form.zapiToken} onChange={v => handleChange("zapiToken", v)} placeholder="seu-token-aqui" icon={Key} type="password" />
                      <Input label="API da instância" value={form.zapiClientToken} onChange={v => handleChange("zapiClientToken", v)} placeholder="client-token" icon={Lock} type="password" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <UserPlus size={14} className="text-blue-400" /> Profissionais
                    </h3>
                    <p className="text-zinc-500 text-xs mb-3">Adicione os barbeiros da barbearia.</p>
                    <div className="space-y-2 mb-3">
                      <input
                        type="text"
                        value={newProfessional}
                        onChange={e => setNewProfessional(e.target.value)}
                        placeholder="Nome do barbeiro"
                        className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-blue-500/60"
                      />
                      <input
                        type="text"
                        value={newProfessionalTitle}
                        onChange={e => setNewProfessionalTitle(e.target.value)}
                        placeholder="Título (ex: Barbeiro Master)"
                        className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder:text-zinc-600 focus:border-blue-500/60"
                      />
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-zinc-700/40 transition-all">
                          <Camera size={14} className="text-zinc-500 shrink-0" />
                          <span className="text-zinc-400 text-sm flex-1 truncate">
                            {newProfessionalAvatar ? "Foto selecionada" : "Foto do barbeiro (opcional)"}
                          </span>
                          <Upload size={14} className="text-zinc-500 shrink-0" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => setNewProfessionalAvatar(ev.target?.result);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {newProfessionalAvatar && (
                          <button
                            onClick={() => setNewProfessionalAvatar("")}
                            className="p-2 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-400 transition-all shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {newProfessionalAvatar && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={newProfessionalAvatar}
                            alt="Preview"
                            className="w-12 h-12 rounded-full object-cover border border-zinc-600/40"
                          />
                          <span className="text-zinc-600 text-xs">
                            {newProfessionalAvatar.length > 100
                              ? `Imagem base64 (${Math.round(newProfessionalAvatar.length * 0.75 / 1024)} KB)`
                              : "URL da foto"}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddProfessional}
                          disabled={!newProfessional.trim()}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                        >
                          {editingProfIndex !== null ? <Check size={14} /> : <Plus size={14} />}
                          {editingProfIndex !== null ? "Atualizar" : "Adicionar"}
                        </button>
                        {editingProfIndex !== null && (
                          <button
                            onClick={() => {
                              setEditingProfIndex(null);
                              setNewProfessional("");
                              setNewProfessionalTitle("");
                              setNewProfessionalAvatar("");
                            }}
                            className="px-4 bg-zinc-700/60 hover:bg-zinc-600/80 text-white rounded-xl text-sm transition-all border border-zinc-600/30"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {professionalsList.length === 0 ? (
                        <p className="text-zinc-600 text-xs text-center py-3">Nenhum profissional adicionado</p>
                      ) : (
                        professionalsList.map((p, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all cursor-pointer group ${
                              editingProfIndex === i
                                ? "bg-blue-600/10 border-blue-500/30"
                                : "bg-zinc-800/30 border-zinc-700/40 hover:bg-zinc-800/50"
                            }`}
                            onClick={() => handleEditProfessional(i)}
                          >
                            {p.avatar ? (
                              <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                                {p.name[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium">{p.name}</p>
                              <p className="text-zinc-500 text-xs truncate">{p.title || "Barbeiro"}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveProfessional(i); }}
                              className="p-1.5 rounded-lg hover:bg-red-600/15 text-zinc-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <Camera size={14} className="text-blue-400" /> Fotos
                    </h3>
                    <p className="text-zinc-500 text-xs mb-3">Adicione fotos da barbearia.</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {form.photos.map((photo, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700/40">
                          <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleChange("photos", form.photos.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-700/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-500/40 hover:bg-blue-600/5 transition-all">
                        <Upload size={20} className="text-zinc-500" />
                        <span className="text-zinc-600 text-[10px]">Adicionar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                const url = ev.target?.result;
                                if (url) handleChange("photos", [...form.photos, url]);
                              };
                              reader.readAsDataURL(file);
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <textarea
                      value={form.photos.join("\n")}
                      onChange={e => handleChange("photos", e.target.value.split("\n").filter(Boolean))}
                      placeholder="Ou cole URLs de fotos (uma por linha)"
                      rows={2}
                      className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-xs outline-none placeholder:text-zinc-600 transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60 resize-none"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex gap-3 pt-2">
                    <button onClick={() => setView("list")} className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/80 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-zinc-600/30">
                      Cancelar
                    </button>
                    <button onClick={handleSave} disabled={!form.name || saving} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:shadow-none">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Adicionar Barbearia"}
                    </button>
                  </motion.div>

                  {editing && (
                    <motion.div variants={itemVariants} className="text-center">
                      <button onClick={() => handleDelete(editing)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">
                        Excluir barbearia
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
