import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Calendar, MapPin, Clock, User, ArrowLeft, ChevronRight, Clock as ClockIcon, Loader2 } from "lucide-react";
import StepProgress from "./StepProgress";
import Step1Professional from "./Step1Professional";
import Step2Services from "./Step2Services";
import Step3DateTime from "./Step3DateTime";
import Step4Payment from "./Step4Payment";
import { formatCurrency } from "../utils/helpers";
import { createAppointment } from "../services/supabase";

const slideVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

function formatDateBr(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function Confetti() {
  const colors = ["#2563eb", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#f97316", "#06b6d4"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(24)].map((_, i) => {
        const size = 4 + Math.random() * 8;
        const isCircle = Math.random() > 0.5;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: size,
              height: isCircle ? size : size * 2.5,
              borderRadius: isCircle ? "50%" : "2px",
              background: colors[i % colors.length],
              left: `${Math.random() * 100}%`,
              top: `${-10 + Math.random() * 20}%`,
            }}
            initial={{ y: -20, opacity: 1, scale: 0, rotate: 0 }}
            animate={{
              y: 200 + Math.random() * 200,
              opacity: [1, 1, 0],
              scale: [0, 1, 0.5],
              rotate: Math.random() * 1080,
              x: (Math.random() - 0.5) * 120,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: i * 0.04,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        );
      })}
    </div>
  );
}

function formatPhoneToWA(digits) {
  const cleaned = digits.replace(/\D/g, "");
  return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
}

function makeWALink(phone, message) {
  return `https://wa.me/${formatPhoneToWA(phone)}?text=${encodeURIComponent(message)}`;
}

export default function NewAppointment({ onAppointmentCreated, userPhone, userName, barbershop }) {
  const [step, setStep] = useState(1);
  const [professional, setProfessional] = useState(null);
  const [services, setServices] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [payment, setPayment] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: "dinheiro", name: "Dinheiro" },
    { id: "pix", name: "PIX" },
    { id: "credito", name: "Crédito" },
    { id: "debito", name: "Débito" },
  ];

  const totalPrice = services.reduce((s, x) => s + x.price, 0);
  const totalDuration = services.reduce((s, x) => s + x.duration, 0);

  function reset() {
    setShowSuccess(false);
    setStep(1);
    setProfessional(null);
    setServices([]);
    setDate(null);
    setTime(null);
    setPayment(null);
  }

  function buildWAMessage() {
    return (
      "\uD83D\uDDA4 *MD BARBEARIA - Confirmação*\n\n" +
      "\u2705 *Agendamento Confirmado!*\n\n" +
      "\uD83D\uDC64 Profissional: " + (professional?.name || "") + "\n" +
      "\uD83D\uDCC5 Data: " + formatDateBr(date) + "\n" +
      "\u23F0 Horário: " + time + "\n" +
      "\uD83D\uDCCD Local: Rua Augusta, 1500 - Consolação, SP\n" +
      "\u2702\uFE0F Serviços: " + services.map(s => s.name).join(", ") + "\n" +
      "\uD83D\uDCB3 Pagamento: " + (paymentMethods.find(p => p.id === payment)?.name || payment) + "\n" +
      "\uD83D\uDCB0 Total: " + formatCurrency(totalPrice) + "\n\n" +
      "\u26A0\uFE0F *Não se atrase!* Chegue com 10 minutos de antecedência.\n\n" +
      "\uD83D\uDD17 Dúvidas? Fale conosco!"
    );
  }

  function buildBarberMessage() {
    return (
      "\uD83D\uDC64 *MD BARBEARIA - Notificação automática*\n\n" +
      "\u2705 *Novo agendamento recebido!*\n\n" +
      "\uD83D\uDC64 *Cliente:* " + (userPhone || "Não informado") + "\n" +
      "\uD83D\uDC64 *Profissional:* " + (professional?.name || "") + "\n" +
      "\uD83D\uDCC5 *Data:* " + formatDateBr(date) + "\n" +
      "\u23F0 *Horário:* " + time + "\n" +
      "\u2702\uFE0F *Serviços:* " + services.map(s => s.name).join(", ") + "\n" +
      "\uD83D\uDCB3 *Pagamento:* " + (paymentMethods.find(p => p.id === payment)?.name || payment) + "\n" +
      "\uD83D\uDCB0 *Total:* " + formatCurrency(totalPrice) + "\n\n" +
      "\u26A0\uFE0F *Lembrete:* O cliente foi orientado a chegar 10 min antes.\n\n" +
      "\uD83D\uDD17 *Para confirmar com o cliente:* https://wa.me/" + formatPhoneToWA(userPhone)
    );
  }

  async function handleConfirm() {
    setLoading(true);
    
    try {
      await createAppointment({
        clientName: userName,
        clientPhone: userPhone,
        professionalName: professional?.name,
        services: services.map((s) => s.name),
        date,
        time,
        paymentMethod: paymentMethods.find((p) => p.id === payment)?.name || payment,
        total: totalPrice,
        totalDuration,
        barbershopSlug: barbershop?.slug,
      });

      // Atualizar estado local
      onAppointmentCreated({
        professional,
        services: services.map((s) => s.name),
        date,
        time,
        paymentMethod: paymentMethods.find((p) => p.id === payment)?.name || payment,
        total: totalPrice,
        status: "Agendado",
      });
      
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      alert("Erro ao confirmar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function btnBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <Confetti />
        <div className="flex flex-col items-center justify-center flex-1 px-5 py-6 relative z-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="w-24 h-24 rounded-full success-circle flex items-center justify-center mb-5 relative"
      >
        <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: "2s" }} />
        <CheckCircle className="text-white relative z-10" size={36} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center"
      >
        <h3 className="text-white text-xl font-extrabold tracking-tight">
          Agendamento Confirmado!
        </h3>
        <div className="mt-1 mb-6 space-y-1">
          <p className="text-zinc-400 text-sm">
            Agendamento salvo no sistema!
          </p>
          <p className="text-blue-400 text-xs font-medium flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Em breve você receberá a confirmação no WhatsApp
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 w-full max-w-xs text-center"
      >
        <p className="text-zinc-400 text-xs">Resumo do agendamento</p>
        <p className="text-white text-sm font-semibold mt-1">{services.map(s => s.name).join(" · ")}</p>
        <p className="text-zinc-500 text-xs mt-0.5">{formatDateBr(date)} às {time}</p>
        <p className="text-white font-bold text-lg mt-2">{formatCurrency(totalPrice)}</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        onClick={reset}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 font-medium text-sm transition-colors mt-4 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Fazer novo agendamento
      </motion.button>
        </div>
      </div>
    );
  }

  const canGoNext = {
    1: !!professional,
    2: services.length > 0,
    3: !!date && !!time,
    4: !!payment,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StepProgress currentStep={step} />

      <div className="flex-1 min-h-0 overflow-y-auto px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="min-h-full flex flex-col"
          >
            {step === 1 && (
              <Step1Professional selected={professional} onSelect={setProfessional} barbershopSlug={barbershop?.slug} />
            )}
            {step === 2 && (
              <Step2Services
                selected={services}
                onToggle={(s) =>
                  setServices((prev) =>
                    prev.some((x) => x.id === s.id)
                      ? prev.filter((x) => x.id !== s.id)
                      : [...prev, s]
                  )
                }
                barbershopSlug={barbershop?.slug}
              />
            )}
            {step === 3 && (
              <Step3DateTime
                selectedDate={date}
                selectedTime={time}
                onSelectDate={setDate}
                onSelectTime={setTime}
                barbershopSlug={barbershop?.slug}
                professionalName={professional?.name}
                selectedServices={services}
              />
            )}
            {step === 4 && (
              <Step4Payment selected={payment} onSelect={setPayment} total={totalPrice} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step 1 Footer */}
      {step === 1 && (
        <div className="bg-zinc-900 border-t border-zinc-800 px-5 py-4">
          <button
            onClick={() => setStep(2)}
            disabled={!canGoNext[1]}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:shadow-none"
          >
            Continuar
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Step 2 Footer */}
      {step === 2 && (
        <div className="bg-zinc-900 border-t border-zinc-800 px-5 py-4">
          <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 text-sm">
                <span className="text-white font-bold">{services.length}</span>{" "}
                serviço{services.length !== 1 ? "s" : ""}
              </span>
              <span className="text-zinc-400 text-xs flex items-center gap-1">
                <ClockIcon size={11} />
                {totalDuration}min
              </span>
              <span className="text-white font-extrabold text-base">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={btnBack}
              className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/80 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-zinc-600/30 hover:border-zinc-500/50"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canGoNext[2]}
              className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:shadow-none"
            >
              Continuar
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 Footer */}
      {step === 3 && (
        <div className="bg-zinc-900 border-t border-zinc-800 px-5 py-4">
          <div className="flex gap-2.5">
            <button
              onClick={btnBack}
              className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/80 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-zinc-600/30 hover:border-zinc-500/50"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!canGoNext[3]}
              className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:shadow-none"
            >
              Continuar
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4 Footer */}
      {step === 4 && (
        <div className="bg-zinc-900 border-t border-zinc-800 px-5 py-4">
          <div className="flex gap-2.5">
            <button
              onClick={btnBack}
              className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/80 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-zinc-600/30 hover:border-zinc-500/50"
            >
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canGoNext[4] || loading}
              className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Confirmar Agendamento
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
