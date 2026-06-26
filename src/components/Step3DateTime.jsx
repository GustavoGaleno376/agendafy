import { useState, useMemo } from "react";
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
import { generateTimeSlots, occupiedSlots } from "../data/mockData";

const timeSlots = generateTimeSlots();

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function Step3DateTime({ selectedDate, selectedTime, onSelectDate, onSelectTime }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

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

  function handleDayClick(day) {
    if (!day || isPastDate(viewYear, viewMonth, day) || isSunday(viewYear, viewMonth, day)) return;
    onSelectDate(dateKey(viewYear, viewMonth, day));
    onSelectTime(null);
  }

  const occupiedForDate = occupiedSlots[selectedDate] || [];

  return (
    <div className="flex flex-col flex-1">
      <div className="px-5 pb-3">
        <h3 className="text-white text-lg font-bold">Data e Horário</h3>
        <p className="text-zinc-400 text-sm mt-0.5">
          Escolha o melhor dia e horário
        </p>
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
              const disabled =
                !day || isPastDate(viewYear, viewMonth, day) || isSunday(viewYear, viewMonth, day);
              const currentKey = day ? dateKey(viewYear, viewMonth, day) : null;
              const active = currentKey === selectedDate;
              const todayHighlight = isToday(viewYear, viewMonth, day);

              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  type="button"
                  className={`text-sm rounded-lg py-1.5 transition-all duration-150 font-medium ${
                    active
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : disabled
                      ? "text-zinc-700 cursor-not-allowed"
                      : todayHighlight
                      ? "border border-blue-500/50 text-blue-400 font-semibold hover:bg-zinc-700/60"
                      : "text-zinc-300 hover:bg-zinc-700/40"
                  }`}
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

            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isOccupied = occupiedForDate.includes(slot);
                const isActive = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    disabled={isOccupied}
                    onClick={() => onSelectTime(slot)}
                    type="button"
                    className={`text-xs py-2.5 rounded-lg font-medium border transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                        : isOccupied
                        ? "bg-zinc-800/20 border-zinc-800/50 text-zinc-700 cursor-not-allowed line-through"
                        : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-blue-500/50 hover:bg-zinc-700/60"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
