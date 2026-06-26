import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, LogOut, Plus, X, ChevronRight, Save, Settings, ExternalLink, Check, Globe, Clock, Phone, MapPin, MessageCircle, Key, Cpu, Hash, Camera, ArrowLeft } from "lucide-react";
import { barbershops as initialBarbershops } from "../data/mockData";

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
  evolutionInstance: "",
  evolutionApiUrl: "",
  evolutionApiKey: "",
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

export default function AdminPage() {
  const [barbershops, setBarbershops] = useState(initialBarbershops);
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBarbershop);
  const [saving, setSaving] = useState(false);

  function handleNew() {
    setForm({ ...emptyBarbershop, id: `b${nextId++}`, slug: "" });
    setEditing(null);
    setView("form");
  }

  function handleEdit(b) {
    setForm({ ...b });
    setEditing(b.id);
    setView("form");
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

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      if (editing) {
        setBarbershops(prev => prev.map(b => b.id === editing ? { ...b, ...form } : b));
      } else {
        setBarbershops(prev => [...prev, form]);
      }
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
            <a href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors group">
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Sair
            </a>
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
                          {b.evolutionApiKey && <Cpu size={10} className="text-green-400" />}
                          <span className="text-zinc-600 text-[10px]">/{b.slug}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {view === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} variants={containerVariants} className="max-w-2xl mx-auto space-y-5">
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
                  <Input label="URL do Instagram (opcional)" value={form.instagramUrl || ""} onChange={v => handleChange("instagramUrl", v)} placeholder="https://instagram.com/barbearia" icon={ExternalLink} />
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
                  <Cpu size={14} className="text-blue-400" /> Evolution API
                </h3>
                <p className="text-zinc-500 text-xs mb-4">Configure a instância do WhatsApp para esta barbearia.</p>
                <div className="space-y-3">
                  <Input label="Nome da Instância" value={form.evolutionInstance} onChange={v => handleChange("evolutionInstance", v)} placeholder="md_barbearia" icon={Hash} />
                  <Input label="URL da API" value={form.evolutionApiUrl} onChange={v => handleChange("evolutionApiUrl", v)} placeholder="http://localhost:8080" icon={Cpu} />
                  <Input label="API Key" value={form.evolutionApiKey} onChange={v => handleChange("evolutionApiKey", v)} placeholder="sua-api-key-aqui" icon={Key} type="password" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Camera size={14} className="text-blue-400" /> Fotos
                </h3>
                <p className="text-zinc-500 text-xs mb-3">URLs das fotos (uma por linha)</p>
                <textarea
                  value={form.photos.join("\n")}
                  onChange={e => handleChange("photos", e.target.value.split("\n").filter(Boolean))}
                  placeholder="https://...foto1.jpg&#10;https://...foto2.jpg"
                  rows={3}
                  className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60 resize-none"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-3 pt-2">
                <button onClick={() => setView("list")} className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/80 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-zinc-600/30">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={!form.name || saving} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:shadow-none">
                  <Save size={16} /> {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Adicionar Barbearia"}
                </button>
              </motion.div>

              {editing && (
                <motion.div variants={itemVariants} className="text-center">
                  <button onClick={() => handleDelete(editing)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">
                    Excluir barbearia
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, icon: Icon, type }) {
  return (
    <div>
      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">{label}</p>
      <div className="relative group">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />}
        <input
          type={type || "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl py-3 ${Icon ? "pl-10" : "pl-4"} pr-4 text-white text-sm placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60`}
        />
      </div>
    </div>
  );
}
