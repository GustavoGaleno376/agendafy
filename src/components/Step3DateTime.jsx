import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import {
  getMonthDays,
  monthNames,
  dayNamesShort,
  isPastDate,
  isSunday,
  isToday,
} from "../utils/helpers";
import { getProfessionalUnavailableDays, getOccupiedTimesByProfessional, getProfessionalSchedule, getProfessionalTimeOff } from "../services/supabase";

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateAllSlots() {
  const slots = [];
  for (let h = 8; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  slots.push("22:00");
  return slots;
}

function getServicesDurationMap() {
  try {
    const stored = localStorage.getItem("agendafy_services_map");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

const dayKeyMap = { 0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday", 4: "thursday", 5: "friday", 6: "saturday" };

export default function Step3DateTime({ selectedDate, selectedTime, onSelectDate, onSelectTime, barbershopSlug, professionalName, selectedServices }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [unavailableDays, setUnavailableDays] = useState([]);
  const [occupiedAppointments, setOccupiedAppointments] = useState([]);
  const [workSchedule, setWorkSchedule] = useState(null);
  const [timeOffList, setTimeOffList] = useState([]);

  const allSlots = useMemo(() => generateAllSlots(), []);

  const totalDuration = useMemo(() => {
    if (!selectedServices || selectedServices.length === 0) return 30;
    return selectedServices.reduce((sum, s) => sum + (s.duration || 30), 0);
  }, [selectedServices]);

  const servicesDurationMap = useMemo(() => getServicesDurationMap(), []);

  useEffect(() => {
    if (barbershopSlug && professionalName) {
      getProfessionalUnavailableDays(barbershopSlug, professionalName)
        .then(days => setUnavailableDays(days))
        .catch(() => {});
      getProfessionalSchedule(barbershopSlug, professionalName)
        .then(data => setWorkSchedule(data))
        .catch(() => {});
      getProfessionalTimeOff(barbershopSlug, professionalName)
        .then(data => setTimeOffList(data || []))
        .catch(() => {});
    }
  }, [barbershopSlug, professionalName]);

  useEffect(() => {
    if (selectedDate && professionalName) {
      getOccupiedTimesByProfessional(selectedDate, professionalName)
        .then(appointments => setOccupiedAppointments(appointments))
        .catch(() => setOccupiedAppointments([]));
    } else {
      setOccupiedAppointments([]);
    }
  }, [selectedDate, professionalName]);

  const blockedSlots = useMemo(() => {
    const blocked = new Set();

    occupiedAppointments.forEach(appt => {
      const startMin = timeToMinutes(appt.time);

      let apptDuration = appt.total_duration || 0;
      if (!apptDuration && appt.services && appt.services.length > 0) {
        appt.services.forEach(svcName => {
          apptDuration += servicesDurationMap[svcName] || 30;
        });
      }
      if (!apptDuration) apptDuration = 30;

      const endMin = startMin + apptDuration;

      for (let min = startMin; min < endMin; min += 30) {
        if (min >= 480 && min <= 1320) {
          blocked.add(minutesToTime(min));
        }
      }
    });

    return blocked;
  }, [occupiedAppointments, servicesDurationMap]);

  const availableSlots = useMemo(() => {
    const now = new Date();
    const isTodayDate = selectedDate === dateKey(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let workStartMin = 480;
    let workEndMin = 1320;
    if (workSchedule?.work_start) workStartMin = timeToMinutes(workSchedule.work_start);
    if (workSchedule?.work_end) workEndMin = timeToMinutes(workSchedule.work_end);

    const dateTimeOff = timeOffList.filter(t => t.date === selectedDate);

    return allSlots.filter(slot => {
      if (blockedSlots.has(slot)) return false;

      const slotMin = timeToMinutes(slot);
      if (slotMin < workStartMin) return false;

      const endMin = slotMin + totalDuration;
      if (endMin > workEndMin) return false;

      for (const off of dateTimeOff) {
        const offStart = timeToMinutes(off.start_time);
        const offEnd = timeToMinutes(off.end_time);
        if (slotMin < offEnd && endMin > offStart) return false;
      }

      if (isTodayDate && slotMin <= currentMinutes) return false;

      for (let min = slotMin; min < endMin; min += 30) {
        const t = minutesToTime(min);
        if (blockedSlots.has(t)) return false;
      }

      return true;
    });
  }, [allSlots, blockedSlots, selectedDate, totalDuration, workSchedule, timeOffList]);

  const days = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function isUnavailable(y, m, day) {
    if (!day) return false;
    const key = dateKey(y, m, day);
    return unavailableDays.includes(key);
  }

  function isWorkDay(y, m, day) {
    if (!day || !workSchedule?.work_days) return true;
    const d = new Date(y, m, day);
    const key = dayKeyMap[d.getDay()];
    return workSchedule.work_days[key] !== false;
  }

  function handleDayClick(day) {
    if (!day || isPastDate(viewYear, viewMonth, day) || isSunday(viewYear, viewMonth, day) || isUnavailable(viewYear, viewMonth, day) || !isWorkDay(viewYear, viewMonth, day)) return;
    onSelectDate(dateKey(viewYear, viewMonth, day));
    onSelectTime(null);
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="px-5 pb-3">
        <h3 className="text-white text-lg font-bold">Data e Horário</h3>
        <p className="text-zinc-400 text-sm mt-0.5">
          Escolha o melhor dia e horário
        </p>
        {professionalName && (
          <p className="text-blue-400 text-xs mt-1">
            Horários disponíveis para {professionalName} · Duração total: {totalDuration}min
          </p>
        )}
      </div>

      <div className="px-5 pb-2">
        <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              type="button"
              className="p-1.5 rounded-lg hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-white text-sm font-semibold tracking-wide">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              type="button"
              className="p-1.5 rounded-lg hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNamesShort.map((d) => (
              <div key={d} className="text-zinc-500 text-[11px] text-center font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dayOff = isUnavailable(viewYear, viewMonth, day);
              const workDayOff = workSchedule?.work_days ? !isWorkDay(viewYear, viewMonth, day) : false;
              const disabled =
                !day || isPastDate(viewYear, viewMonth, day) || isSunday(viewYear, viewMonth, day) || dayOff || workDayOff;
              const currentKey = day ? dateKey(viewYear, viewMonth, day) : null;
              const active = currentKey === selectedDate;
              const todayHighlight = isToday(viewYear, viewMonth, day);

              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  type="button"
                  className={`text-sm rounded-lg py-1.5 transition-all duration-150 font-medium relative ${
                    active
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : disabled
                      ? dayOff || workDayOff
                        ? "text-zinc-700 cursor-not-allowed line-through"
                        : "text-zinc-700 cursor-not-allowed"
                      : todayHighlight
                      ? "border border-blue-500/50 text-blue-400 font-semibold hover:bg-zinc-700/60"
                      : "text-zinc-300 hover:bg-zinc-700/40"
                  }`}
                  title={dayOff ? "Dia indisponível" : workDayOff ? "Fora do horário de trabalho" : ""}
                >
                  {day || ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Circle size={7} className="fill-green-500 text-green-500" /> Disponível
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Circle size={7} className="fill-red-500 text-red-500" /> Ocupado
              </span>
            </div>

            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">Nenhum horário disponível para esta data</p>
                <p className="text-zinc-600 text-xs mt-1">Tente escolher outro dia</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {allSlots.map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  const isOccupied = blockedSlots.has(slot);
                  const isActive = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      disabled={!isAvailable}
                      onClick={() => onSelectTime(slot)}
                      type="button"
                      className={`text-xs py-2.5 rounded-lg font-medium border transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                          : isOccupied || !isAvailable
                          ? "bg-zinc-800/20 border-zinc-800/50 text-zinc-700 cursor-not-allowed line-through"
                          : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-blue-500/50 hover:bg-zinc-700/60"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
