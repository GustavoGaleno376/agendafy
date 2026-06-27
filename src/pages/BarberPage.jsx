import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, LogOut, CheckCircle, XCircle, Clock, Wallet, Scissors, Users, Edit3, Send, X, Plus, Trash2, Camera, Upload, CalendarDays, CalendarOff, AlertTriangle } from "lucide-react";
import { barbershops } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import {
  supabase,
  getAppointments,
  updateAppointment,
  getProfessionals,
  getProfessionalUnavailableDays,
  toggleProfessionalDayOff,
  getBarbershopIdBySlug,
  getServicesByBarbershop,
  saveService,
  deleteService,
  saveProfessionalAvatar,
  getProfessionalSchedule,
  saveProfessionalSchedule,
  getProfessionalTimeOff,
  saveProfessionalTimeOff,
  deleteProfessionalTimeOff,
} from "../services/supabase";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "schedule", label: "Agenda", icon: Calendar },
  { id: "config", label: "Configurar", icon: Scissors },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function BarberPage() {
  const { slug } = useParams();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const barbershop = barbershops.find((b) => b.slug === slug);
  const professionalName = user?.professionalName || "";

  const [appointments, setAppointments] = useState([]);
  const [editingAppt, setEditingAppt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [professionalsFromDb, setProfessionalsFromDb] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [togglingDayOff, setTogglingDayOff] = useState(false);
  const [barbershopId, setBarbershopId] = useState(null);

  const [servicesList, setServicesList] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: "", duration: "", price: "" });
  const [savingService, setSavingService] = useState(false);
  const [barberProfileAvatar, setBarberProfileAvatar] = useState(null);

  const [workDays, setWorkDays] = useState({
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false,
  });
  const [workStart, setWorkStart] = useState("08:00");
  const [workEnd, setWorkEnd] = useState("22:00");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [timeOffList, setTimeOffList] = useState([]);
  const [newTimeOff, setNewTimeOff] = useState({ date: "", startTime: "08:00", endTime: "09:00", reason: "" });
  const [savingTimeOff, setSavingTimeOff] = useState(false);
  const prevWorkDaysRef = useRef(null);
  const [confirmSchedule, setConfirmSchedule] = useState(null);
  const dayNameToNumber = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

  const [activeTab, setActiveTab] = useState("dashboard");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  useEffect(() => {
    getAppointments()
      .then(data => setAppointments(data))
      .catch(console.error);

    if (slug) {
      getProfessionals(slug)
        .then(data => setProfessionalsFromDb(data))
        .catch(console.error);

      getProfessionalUnavailableDays(slug, professionalName)
        .then(dates => setUnavailableDates(dates))
        .catch(console.error);

      getBarbershopIdBySlug(slug)
        .then(id => {
          setBarbershopId(id);
          if (id) {
            getServicesByBarbershop(slug)
              .then(svcs => {
                const seen = new Set();
                const unique = svcs.filter(s => {
                  const key = s.name.toLowerCase();
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });
                setServicesList(unique);
                const durationMap = {};
                unique.forEach(s => { durationMap[s.name] = s.duration; });
                localStorage.setItem("agendafy_services_map", JSON.stringify(durationMap));
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [slug, professionalName]);

  useEffect(() => {
    if (slug && professionalName) {
      const debouncedLoad = setTimeout(() => {
        getProfessionals(slug)
          .then(data => {
            const prof = data.find(p => p.name === professionalName);
            if (prof && prof.avatar) {
              setBarberProfileAvatar(prof.avatar);
            }
          })
          .catch(console.error);
      }, 1000);
      return () => clearTimeout(debouncedLoad);
    }
  }, [slug, professionalName]);

  useEffect(() => {
    if (slug && professionalName) {
      getProfessionalSchedule(slug, professionalName).then(data => {
        if (data) {
          if (data.work_days) {
            setWorkDays(data.work_days);
            prevWorkDaysRef.current = { ...data.work_days };
          }
          if (data.work_start) setWorkStart(data.work_start);
          if (data.work_end) setWorkEnd(data.work_end);
        }
      }).catch(console.error);
      getProfessionalTimeOff(slug, professionalName).then(data => {
        setTimeOffList(data || []);
      }).catch(console.error);
    }
  }, [slug, professionalName]);

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-lg">Barbearia não encontrada</p>
          <a href="/" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Voltar</a>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const myAppointments = appointments.filter(a => a.professional_name === professionalName);

  const sortedAppointments = [...myAppointments].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const todayApptsSorted = sortedAppointments.filter(a => a.date === today);
  const futureAppts = sortedAppointments.filter(a => a.date > today);
  const pastAppts = sortedAppointments.filter(a => a.date < today).reverse();

  let globalIndex = 0;

  const stats = [
    { label: "Agendamentos Hoje", value: todayApptsSorted.length, icon: Calendar, color: "from-blue-500 to-blue-600" },
    { label: "Confirmados", value: todayApptsSorted.filter(a => a.status === "Confirmado").length, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
    { label: "Esperando", value: todayApptsSorted.filter(a => a.status === "Agendado").length, icon: Clock, color: "from-yellow-500 to-yellow-600" },
    { label: "Total", value: myAppointments.length, icon: Wallet, color: "from-violet-500 to-violet-600" },
  ];

  function openEdit(appt) {
    const svcs = Array.isArray(appt.services) ? [...appt.services] : appt.service ? [appt.service] : [];
    setEditingAppt({ ...appt, services: svcs, editMessage: "" });
  }

  function handleEditChange(field, value) {
    setEditingAppt(prev => ({ ...prev, [field]: value }));
  }

  function toggleServiceEdit(serviceName) {
    setEditingAppt(prev => {
      const svcs = prev.services || [];
      const idx = svcs.indexOf(serviceName);
      if (idx >= 0) {
        return { ...prev, services: svcs.filter(s => s !== serviceName) };
      }
      return { ...prev, services: [...svcs, serviceName] };
    });
  }

  async function handleSaveEdit() {
    if (!editingAppt) return;
    setSaving(true);

    const newTotalDuration = (editingAppt.services || []).reduce((sum, svcName) => {
      const svc = servicesList.find(s => s.name === svcName);
      return sum + (svc?.duration || 30);
    }, 0);

    const updated = {
      time: editingAppt.time,
      services: editingAppt.services,
      status: editingAppt.status,
      total_duration: newTotalDuration || null,
    };

    try {
      await updateAppointment(editingAppt.id, updated);

      setAppointments(prev =>
        prev.map(a => a.id === editingAppt.id ? { ...a, ...updated } : a)
      );

      const svcList = (editingAppt.services || []).join(", ");
      const message = editingAppt.editMessage ||
        `✂️ *${barbershop.name}* - Seu agendamento foi atualizado!\n\n👤 Cliente: ${editingAppt.client_name || editingAppt.client}\n⏰ Horário: ${editingAppt.time}\n✂️ Serviços: ${svcList}\n📌 Status: ${editingAppt.status}`;

      await supabase.functions
        .invoke("send-whatsapp", {
          body: {
            type: "update",
            clientPhone: editingAppt.client_phone,
            professionalName: editingAppt.client_name || editingAppt.client,
            services: editingAppt.services,
            date: editingAppt.date || new Date().toISOString().split("T")[0],
            time: editingAppt.time,
            customMessage: message,
            barbershopSlug: slug,
          },
        });

      setSentMessage(`Mensagem enviada para ${editingAppt.client_name || editingAppt.client}!`);
      setTimeout(() => setSentMessage(""), 3000);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      setSentMessage("Erro ao salvar");
      setTimeout(() => setSentMessage(""), 3000);
    }

    setSaving(false);
    setEditingAppt(null);
  }

  const todayKey = new Date().toISOString().split("T")[0];
  const isUnavailableToday = unavailableDates.includes(todayKey);

  async function handleToggleDayOff() {
    setTogglingDayOff(true);
    try {
      const newState = !isUnavailableToday;
      await toggleProfessionalDayOff(slug, professionalName, todayKey, newState);
      setUnavailableDates(prev =>
        newState ? [...prev, todayKey] : prev.filter(d => d !== todayKey)
      );
    } catch (err) {
      console.error("Erro ao alterar disponibilidade:", err);
    }
    setTogglingDayOff(false);
  }

  const dayLabels = {
    monday: "Seg", tuesday: "Ter", wednesday: "Qua", thursday: "Qui", friday: "Sex", saturday: "Sáb", sunday: "Dom",
  };

  async function handleSaveSchedule() {
    const prev = prevWorkDaysRef.current;
    const removedDays = prev
      ? Object.entries(prev).filter(([d, v]) => v && !workDays[d]).map(([d]) => d)
      : [];

    if (removedDays.length > 0) {
      const removedNumbers = removedDays.map(d => dayNameToNumber[d]);
      const todayStr = new Date().toISOString().split("T")[0];
      const affected = myAppointments.filter(a => {
        if (a.date <= todayStr) return false;
        if (["Cancelado", "Concluído"].includes(a.status)) return false;
        const d = new Date(a.date + "T00:00:00");
        return removedNumbers.includes(d.getDay());
      });

      if (affected.length > 0) {
        setConfirmSchedule({
          schedule: { work_days: workDays, work_start: workStart, work_end: workEnd },
          affected,
          removedDays,
        });
        return;
      }
    }

    await doSaveSchedule({ work_days: workDays, work_start: workStart, work_end: workEnd });
  }

  async function doSaveSchedule(schedule) {
    setSavingSchedule(true);
    try {
      await saveProfessionalSchedule(slug, professionalName, schedule);
      prevWorkDaysRef.current = { ...schedule.work_days };
      setSentMessage("Horários salvos!");
      setTimeout(() => setSentMessage(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar horários:", err);
    }
    setSavingSchedule(false);
    setConfirmSchedule(null);
  }

  async function handleAddTimeOff() {
    if (!newTimeOff.date || !newTimeOff.startTime || !newTimeOff.endTime) return;
    setSavingTimeOff(true);
    try {
      await saveProfessionalTimeOff(
        slug, professionalName,
        newTimeOff.date, newTimeOff.startTime, newTimeOff.endTime, newTimeOff.reason
      );
      const updated = await getProfessionalTimeOff(slug, professionalName);
      setTimeOffList(updated || []);
      setNewTimeOff({ date: "", startTime: "08:00", endTime: "09:00", reason: "" });
      setSentMessage("Folga adicionada!");
      setTimeout(() => setSentMessage(""), 3000);
    } catch (err) {
      console.error("Erro ao adicionar folga:", err);
    }
    setSavingTimeOff(false);
  }

  async function handleDeleteTimeOff(id) {
    try {
      await deleteProfessionalTimeOff(id);
      setTimeOffList(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Erro ao deletar folga:", err);
    }
  }

  async function handleSaveService() {
    if (!serviceForm.name || !serviceForm.duration || !serviceForm.price) return;
    const duplicate = !editingService && servicesList.some(s => s.name.toLowerCase() === serviceForm.name.trim().toLowerCase());
    if (duplicate) {
      setSentMessage("Serviço já existe");
      setTimeout(() => setSentMessage(""), 3000);
      return;
    }
    setSavingService(true);
    try {
      const svc = {
        ...(editingService ? { id: editingService.id } : {}),
        name: serviceForm.name.trim(),
        duration: parseInt(serviceForm.duration),
        price: parseFloat(serviceForm.price),
      };
      const saved = await saveService(barbershopId, svc);

      if (editingService) {
        setServicesList(prev => prev.map(s => s.id === editingService.id ? { ...s, ...svc } : s));
      } else {
        setServicesList(prev => [...prev, saved]);
      }

      const updatedServices = editingService
        ? servicesList.map(s => s.id === editingService.id ? { ...s, ...svc } : s)
        : [...servicesList, saved];
      const durationMap = {};
      updatedServices.forEach(s => { durationMap[s.name] = s.duration; });
      localStorage.setItem("agendafy_services_map", JSON.stringify(durationMap));

      setServiceForm({ name: "", duration: "", price: "" });
      setEditingService(null);
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
    }
    setSavingService(false);
  }

  async function handleDeleteService(serviceId) {
    try {
      await deleteService(serviceId);
      const updatedServices = servicesList.filter(s => s.id !== serviceId);
      setServicesList(updatedServices);
      const durationMap = {};
      updatedServices.forEach(s => { durationMap[s.name] = s.duration; });
      localStorage.setItem("agendafy_services_map", JSON.stringify(durationMap));
    } catch (err) {
      console.error("Erro ao deletar serviço:", err);
    }
  }

  function startEditService(svc) {
    setEditingService(svc);
    setServiceForm({ name: svc.name, duration: String(svc.duration), price: String(svc.price) });
  }

  function cancelEditService() {
    setEditingService(null);
    setServiceForm({ name: "", duration: "", price: "" });
  }

  function getAvatar(p) {
    if (barberProfileAvatar) return barberProfileAvatar;
    if (p?.avatar) return p.avatar;
    const seed = professionalName || "B";
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&background=random&radius=50`;
  }

  const profilePic = getAvatar(professionalsFromDb.find(p => p.name === professionalName));

  return (
    <div className="min-h-screen bg-zinc-950 text-white bg-noise">
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img
              src={profilePic}
              alt={professionalName}
              className="w-12 h-12 rounded-xl object-cover border border-blue-600/30" />
            <div>
              <h1 className="text-xl font-bold text-gradient-white">{barbershop.name}</h1>
              <p className="text-zinc-500 text-sm">{professionalName || "Painel do barbeiro"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/b/${slug}`} target="_blank" className="text-blue-400 text-xs font-medium hover:underline opacity-70 hover:opacity-100 transition-opacity">
              Link público →
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors group">
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Sair
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-1 bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-1 mb-6">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/30"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      variants={itemVariants}
                      className="card-glass rounded-xl p-4 text-center card-glass-hover card-glow relative overflow-hidden group"
                    >
                      <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-blue-600/5 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 shadow-lg relative z-10`}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <p className="text-white font-bold text-lg relative z-10">{s.value}</p>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-0.5 relative z-10">{s.label}</p>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Calendar size={14} className="text-blue-400" />
                    Agendamentos
                  </h3>
                  {sentMessage && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-xs">
                      {sentMessage}
                    </motion.span>
                  )}
                </div>
                <div className="space-y-4">
                  {myAppointments.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-8">Nenhum agendamento encontrado</p>
                  ) : (
                    <>
                      {todayApptsSorted.length > 0 && (
                        <div>
                          <p className="text-blue-400 text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            Hoje — {todayApptsSorted.length} agendamento{todayApptsSorted.length !== 1 ? "s" : ""}
                          </p>
                          <div className="space-y-1.5">
                            {todayApptsSorted.map((a) => {
                              const idx = ++globalIndex;
                              return (
                                <AppointmentRow key={a.id} a={a} idx={idx} openEdit={openEdit} />
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {futureAppts.length > 0 && (
                        <div>
                          <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                            Próximos — {futureAppts.length} agendamento{futureAppts.length !== 1 ? "s" : ""}
                          </p>
                          <div className="space-y-1.5">
                            {futureAppts.map((a) => {
                              const idx = ++globalIndex;
                              return (
                                <AppointmentRow key={a.id} a={a} idx={idx} openEdit={openEdit} />
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {pastAppts.length > 0 && (
                        <div>
                          <p className="text-zinc-600 text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            Anteriores — {pastAppts.length} agendamento{pastAppts.length !== 1 ? "s" : ""}
                          </p>
                          <div className="space-y-1.5">
                            {pastAppts.map((a) => {
                              const idx = ++globalIndex;
                              return (
                                <AppointmentRow key={a.id} a={a} idx={idx} openEdit={openEdit} />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              variants={containerVariants}
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Users size={14} className="text-blue-400" /> Profissionais
                </h3>
                {professionalsFromDb.map((p, i) => (
                  <motion.div
                    key={p.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 py-3 border-b border-zinc-700/30 last:border-0"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      p.name === professionalName
                        ? "bg-gradient-to-br from-blue-600 to-blue-500"
                        : "bg-gradient-to-br from-zinc-600 to-zinc-700"
                    }`}>
                      {p.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-zinc-500 text-xs">{p.title}</p>
                    </div>
                    {p.name === professionalName ? (
                      <span className="text-blue-400 text-xs flex items-center gap-1 font-medium">
                        <CheckCircle size={10} /> Você
                      </span>
                    ) : (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <CheckCircle size={10} /> Ativo
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <CalendarDays size={14} className="text-blue-400" /> Meus Horários
                </h3>

                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 ml-1">Dias de Trabalho</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Object.entries(dayLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setWorkDays(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        workDays[key]
                          ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                          : "bg-zinc-800/40 border-zinc-700/40 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Início</p>
                    <input
                      type="time"
                      value={workStart}
                      onChange={e => setWorkStart(e.target.value)}
                      className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Fim</p>
                    <input
                      type="time"
                      value={workEnd}
                      onChange={e => setWorkEnd(e.target.value)}
                      className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveSchedule}
                  disabled={savingSchedule}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 disabled:cursor-not-allowed mb-3"
                >
                  {savingSchedule ? "Salvando..." : <><CheckCircle size={14} /> Salvar Horários</>}
                </button>

                <div className="border-t border-zinc-700/30 pt-4 mt-2">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-3 ml-1">Hoje</p>
                  <button
                    onClick={handleToggleDayOff}
                    disabled={togglingDayOff}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      isUnavailableToday
                        ? "bg-green-600 hover:bg-green-500 text-white"
                        : "bg-red-600/80 hover:bg-red-500 text-white"
                    }`}
                  >
                    {togglingDayOff ? (
                      "Aguarde..."
                    ) : isUnavailableToday ? (
                      <> <CheckCircle size={14} /> Marcar como disponível hoje</>
                    ) : (
                      <> <XCircle size={14} /> Não atendo hoje</>
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <CalendarOff size={14} className="text-red-400" /> Folgas Específicas
                </h3>

                <div className="space-y-2 mb-4">
                  {timeOffList.length === 0 ? (
                    <p className="text-zinc-600 text-xs text-center py-4">Nenhuma folga registrada</p>
                  ) : (
                    timeOffList.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-zinc-800/30 border border-zinc-700/20 rounded-xl px-4 py-2.5">
                        <div>
                          <p className="text-white text-xs font-medium">
                            {new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-zinc-500 text-[10px]">
                            {t.start_time} às {t.end_time}{t.reason ? ` · ${t.reason}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTimeOff(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-600/20 text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-700/30 pt-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-3 ml-1">Nova Folga</p>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={newTimeOff.date}
                      onChange={e => setNewTimeOff(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={newTimeOff.startTime}
                        onChange={e => setNewTimeOff(prev => ({ ...prev, startTime: e.target.value }))}
                        className="flex-1 bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                      />
                      <input
                        type="time"
                        value={newTimeOff.endTime}
                        onChange={e => setNewTimeOff(prev => ({ ...prev, endTime: e.target.value }))}
                        className="flex-1 bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                      />
                    </div>
                    <input
                      type="text"
                      value={newTimeOff.reason}
                      onChange={e => setNewTimeOff(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Motivo (opcional)"
                      className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60 placeholder:text-zinc-600"
                    />
                    <button
                      onClick={handleAddTimeOff}
                      disabled={savingTimeOff || !newTimeOff.date || !newTimeOff.startTime || !newTimeOff.endTime}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {savingTimeOff ? "Adicionando..." : <><Plus size={14} /> Adicionar Folga</>}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Camera size={14} className="text-blue-400" /> Minha Foto
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    src={profilePic}
                    alt={professionalName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-600/30"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{professionalName}</p>
                    <p className="text-zinc-500 text-xs mb-2">Clique para alterar sua foto de perfil</p>
                    <label className="inline-flex items-center gap-2 bg-zinc-800/40 hover:bg-zinc-700/40 border border-zinc-700/60 rounded-xl px-4 py-2 cursor-pointer transition-all text-sm text-zinc-300">
                      <Upload size={14} />
                      {barberProfileAvatar ? "Trocar foto" : "Enviar foto"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                          onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async ev => {
                            const dataUrl = ev.target?.result;
                            if (dataUrl && slug && professionalName) {
                              setBarberProfileAvatar(dataUrl);
                              try {
                                await saveProfessionalAvatar(slug, professionalName, dataUrl);
                              } catch (err) {
                                console.error("Erro ao salvar avatar:", err);
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass rounded-xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Scissors size={14} className="text-blue-400" /> Serviços da Barbearia
                </h3>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Nome do serviço</p>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={e => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Corte, Barba, Luzes..."
                      className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Duração (min)</p>
                      <input
                        type="number"
                        value={serviceForm.duration}
                        onChange={e => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="30"
                        min="1"
                        className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Preço (R$)</p>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={e => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="25"
                        min="0"
                        step="0.50"
                        className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleSaveService}
                    disabled={savingService || !serviceForm.name || !serviceForm.duration || !serviceForm.price}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {savingService ? "Salvando..." : editingService ? <><CheckCircle size={14} /> Atualizar</> : <><Plus size={14} /> Adicionar</>}
                  </button>
                  {editingService && (
                    <button
                      onClick={cancelEditService}
                      className="px-4 py-2.5 bg-zinc-700/60 hover:bg-zinc-600/80 text-white text-sm rounded-xl transition-all duration-200 border border-zinc-600/30"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {servicesList.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center justify-between py-3 px-3 rounded-xl border transition-all duration-200 ${
                        editingService?.id === s.id
                          ? "bg-blue-600/10 border-blue-500/30"
                          : "bg-zinc-800/30 border-zinc-700/20 hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex-1">
                        <span className="text-white text-sm font-medium">{s.name}</span>
                        <span className="text-zinc-500 text-xs ml-2">
                          {formatCurrency(s.price)} · {s.duration}min
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditService(s)}
                          className="p-1.5 rounded-lg bg-zinc-700/40 hover:bg-blue-600/20 text-zinc-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="p-1.5 rounded-lg bg-zinc-700/40 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {servicesList.length === 0 && (
                    <p className="text-zinc-600 text-xs text-center py-4">Nenhum serviço cadastrado</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="card-glass rounded-xl p-5 text-center py-16">
                <Calendar size={40} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 text-sm font-medium">Calendário completo em breve</p>
                <p className="text-zinc-600 text-xs mt-1">Visualize e gerencie todos os agendamentos por mês</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingAppt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingAppt(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="w-full max-w-md bg-gradient-to-b from-zinc-900/98 to-zinc-950/98 backdrop-blur-xl border border-zinc-800/80 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10 flex items-center justify-between p-5 border-b border-zinc-800/60">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Edit3 size={14} className="text-blue-400" /> Editar Agendamento
                </h3>
                <button onClick={() => setEditingAppt(null)} className="p-1.5 rounded-lg hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all duration-200">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Cliente</p>
                  <p className="text-white text-sm font-medium bg-zinc-800/30 rounded-xl px-4 py-3">
                    {editingAppt.client_name || editingAppt.client}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Telefone</p>
                  <p className="text-white text-sm bg-zinc-800/30 rounded-xl px-4 py-3">{editingAppt.client_phone}</p>
                </div>

                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Data</p>
                  <input
                    type="date"
                    value={editingAppt.date || ""}
                    onChange={e => handleEditChange("date", e.target.value)}
                    className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                  />
                </div>

                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Horário</p>
                  <input
                    type="text"
                    value={editingAppt.time}
                    onChange={e => handleEditChange("time", e.target.value)}
                    className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60"
                  />
                </div>

                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Serviços</p>
                  <div className="space-y-1.5">
                    {servicesList.map(s => {
                      const selected = (editingAppt.services || []).includes(s.name);
                      return (
                        <label
                          key={s.id}
                          onClick={() => toggleServiceEdit(s.name)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                            selected
                              ? "bg-blue-600/15 border-blue-500/40 text-white"
                              : "bg-zinc-800/30 border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            selected ? "bg-blue-500 border-blue-500" : "border-zinc-600"
                          }`}>
                            {selected && <div className="w-2 h-2 rounded-sm bg-white" />}
                          </div>
                          <span className="text-sm flex-1">{s.name}</span>
                          <span className="text-[10px] text-zinc-500">{formatCurrency(s.price)} · {s.duration}min</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Status</p>
                  <select
                    value={editingAppt.status || "Agendado"}
                    onChange={e => handleEditChange("status", e.target.value)}
                    className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60 appearance-none cursor-pointer"
                  >
                    <option value="Agendado">Agendado</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5 ml-1">Mensagem (opcional)</p>
                  <textarea
                    value={editingAppt.editMessage || ""}
                    onChange={e => handleEditChange("editMessage", e.target.value)}
                    placeholder="Ex: Seu horário foi alterado para..."
                    rows={3}
                    className="w-full bg-zinc-800/40 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-blue-500/60 focus:bg-zinc-800/60 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditingAppt(null)}
                    className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/80 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-zinc-600/30"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:shadow-none"
                  >
                    <Send size={16} />
                    {saving ? "Salvando..." : "Salvar e Notificar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setConfirmSchedule(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="w-full max-w-md bg-gradient-to-b from-zinc-900/98 to-zinc-950/98 backdrop-blur-xl border border-zinc-800/80 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10 flex items-center justify-between p-5 border-b border-zinc-800/60">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-400" /> Atenção
                </h3>
                <button onClick={() => setConfirmSchedule(null)} className="p-1.5 rounded-lg hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all duration-200">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-zinc-300 text-sm">
                  Você desativou os seguintes dias da semana:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {confirmSchedule.removedDays.map(d => (
                    <span key={d} className="px-2.5 py-1 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-medium">
                      {dayLabels[d]}
                    </span>
                  ))}
                </div>

                <p className="text-zinc-300 text-sm">
                  Existem <strong className="text-white">{confirmSchedule.affected.length} agendamento{confirmSchedule.affected.length !== 1 ? "s" : ""}</strong> futuro{confirmSchedule.affected.length !== 1 ? "s" : ""} nesse{confirmSchedule.removedDays.length > 1 ? "s" : ""} dia{confirmSchedule.removedDays.length > 1 ? "s" : ""}:
                </p>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {confirmSchedule.affected.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-zinc-800/30 border border-zinc-700/20 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-white text-xs font-medium">{a.client_name || a.client_phone}</p>
                        <p className="text-zinc-500 text-[10px]">
                          {new Date(a.date + "T00:00:00").toLocaleDateString("pt-BR")} às {a.time}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.status === "Confirmado"
                          ? "bg-green-600/15 text-green-400"
                          : "bg-yellow-600/15 text-yellow-400"
                      }`}>{a.status}</span>
                    </div>
                  ))}
                </div>

                <p className="text-zinc-400 text-xs">
                  Ao salvar, esses clientes continuarão com seus agendamentos, mas novos agendamentos não poderão ser feitos nesse{confirmSchedule.removedDays.length > 1 ? "s" : ""} dia{confirmSchedule.removedDays.length > 1 ? "s" : ""}.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setConfirmSchedule(null)}
                    className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/80 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-zinc-600/30"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => doSaveSchedule(confirmSchedule.schedule)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30"
                  >
                    <CheckCircle size={16} />
                    Salvar mesmo assim
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppointmentRow({ a, idx, openEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 bg-zinc-800/40 rounded-xl p-3 border border-zinc-700/40 hover:bg-zinc-700/30 transition-all duration-300 group"
    >
      <div className="w-6 h-6 rounded-md bg-zinc-700/60 flex items-center justify-center text-zinc-400 text-[11px] font-bold shrink-0">
        {idx}
      </div>
      <div className="text-zinc-400 text-sm font-mono w-12 shrink-0">{a.time}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{a.client_name || a.client_phone || "Sem nome"}</p>
        <p className="text-zinc-500 text-xs">
          {Array.isArray(a.services) ? a.services.join(", ") : a.services || a.service}
        </p>
        <p className="text-zinc-600 text-[10px]">{a.date}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
        a.status === "Confirmado"
          ? "bg-green-600/15 text-green-400 border border-green-600/30"
          : a.status === "Cancelado"
          ? "bg-red-600/15 text-red-400 border border-red-600/30"
          : a.status === "Concluído"
          ? "bg-blue-600/15 text-blue-400 border border-blue-600/30"
          : "bg-yellow-600/15 text-yellow-400 border border-yellow-600/30"
      }`}>{a.status || "Agendado"}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => openEdit(a)}
          className="p-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 transition-colors active:scale-90"
        >
          <Edit3 size={14} />
        </button>
      </div>
    </motion.div>
  );
}