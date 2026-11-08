import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Sun, Sunset, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { getUpcomingDays, formatFullDatePortuguese } from '../utils/dateUtils';

export default function StepDateTime({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  blockedSlots = {},
  onBack,
  onNext,
  largeTextMode,
  studioInfo
}) {
  const upcomingDays = useMemo(() => getUpcomingDays(14), []);

  const morningSlots = studioInfo.timeSlotsMorning || ['08:30', '09:30', '10:30', '11:30'];
  const afternoonSlots = studioInfo.timeSlotsAfternoon || ['13:30', '14:30', '15:30', '16:30', '17:30', '18:30'];

  const currentDateObj = upcomingDays.find(d => d.dateKey === selectedDate);
  const isSunday = currentDateObj?.isSunday;

  return (
    <div className="pb-32 px-4">
      {/* Step Heading */}
      <div className="mb-4">
        <h2 className={`font-bold text-stone-900 ${largeTextMode ? 'text-xl' : 'text-lg'}`}>
          2. Escolha o melhor dia e horário
        </h2>
        <p className="text-stone-500 text-xs mt-0.5">
          Toque no dia desejado e em seguida no horário disponível
        </p>
      </div>

      {/* Date Carousel (Large Touch Cards) */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">
          Selecione o Dia:
        </label>
        
        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-1 px-1">
          {upcomingDays.map((day) => {
            const isSelected = selectedDate === day.dateKey;
            
            return (
              <button
                key={day.dateKey}
                disabled={day.isSunday}
                onClick={() => {
                  onSelectDate(day.dateKey);
                  // Reset selected time if date changed
                  if (selectedDate !== day.dateKey) {
                    onSelectTime('');
                  }
                }}
                className={`min-w-[82px] py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all border-2 text-center ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-lg scale-105'
                    : day.isSunday
                    ? 'bg-stone-100 text-stone-400 border-stone-200/60 opacity-50 cursor-not-allowed'
                    : 'bg-white text-stone-700 border-rose-100 hover:border-rose-300 active:scale-95 shadow-xs'
                }`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-tight ${
                  isSelected ? 'text-rose-100' : 'text-rose-600'
                }`}>
                  {day.isToday ? 'Hoje' : day.isTomorrow ? 'Amanhã' : day.dayOfWeek}
                </span>

                <span className="text-2xl font-extrabold my-0.5 leading-tight">
                  {day.dayOfMonth}
                </span>

                <span className={`text-[10px] font-semibold ${
                  isSelected ? 'text-rose-100' : 'text-stone-500'
                }`}>
                  {day.isSunday ? 'Fechado' : day.monthName.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Area */}
      {selectedDate && !isSunday ? (
        <div className="space-y-5 animate-fade-in">
          {/* Selected Date Reminder */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-rose-600 font-semibold uppercase">Data Selecionada</p>
              <p className="font-bold text-stone-800 text-sm">
                {formatFullDatePortuguese(selectedDate)}
              </p>
            </div>
          </div>

          {/* Morning Slots */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-stone-800 font-bold text-sm">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Manhã</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {morningSlots.map((time) => {
                const isSelected = selectedTime === time;
                const slotKey = `${selectedDate}_${time}`;
                const isBlocked = blockedSlots[slotKey];

                return (
                  <button
                    key={time}
                    disabled={isBlocked}
                    onClick={() => onSelectTime(time)}
                    className={`min-h-[54px] rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all border-2 ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102'
                        : isBlocked
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                        : 'bg-white text-stone-800 border-rose-100 hover:border-rose-300 hover:bg-rose-50/30 active:scale-95'
                    } ${largeTextMode ? 'text-lg' : 'text-base'}`}
                  >
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-rose-400'}`} />
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-stone-800 font-bold text-sm">
              <Sunset className="w-4 h-4 text-rose-500" />
              <span>Tarde</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {afternoonSlots.map((time) => {
                const isSelected = selectedTime === time;
                const slotKey = `${selectedDate}_${time}`;
                const isBlocked = blockedSlots[slotKey];

                return (
                  <button
                    key={time}
                    disabled={isBlocked}
                    onClick={() => onSelectTime(time)}
                    className={`min-h-[54px] rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all border-2 ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102'
                        : isBlocked
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                        : 'bg-white text-stone-800 border-rose-100 hover:border-rose-300 hover:bg-rose-50/30 active:scale-95'
                    } ${largeTextMode ? 'text-lg' : 'text-base'}`}
                  >
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-rose-400'}`} />
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : isSunday ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-rose-100 apple-shadow">
          <p className="text-stone-700 font-bold">O salão não abre aos domingos.</p>
          <p className="text-stone-500 text-xs mt-1">Por favor, escolha de segunda a sábado!</p>
        </div>
      ) : null}

      {/* Navigation Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-rose-200/80 shadow-2xl z-40 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="min-h-[56px] px-4 rounded-2xl font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-95 border border-rose-200 flex items-center justify-center gap-1 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <button
            onClick={onNext}
            disabled={!selectedDate || !selectedTime || isSunday}
            className={`flex-1 min-h-[56px] px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
              selectedDate && selectedTime && !isSunday
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            } ${largeTextMode ? 'text-base' : 'text-sm'}`}
          >
            <span>Continuar para Meus Dados</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
