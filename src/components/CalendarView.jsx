import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthMatrix, MONTH_NAMES_PT, WEEKDAYS_PT } from '../utils/calendarUtils';

export default function CalendarView({
  selectedDate,
  onSelectDate,
  isAdmin = false,
  appointmentsByDate = {},
  allowPast = false,
  compact = false
}) {
  const initialDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  const matrix = getMonthMatrix(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-rose-200/80 shadow-xs ${
      compact ? 'p-3' : 'p-4 sm:p-5'
    }`}>
      {/* Month Navigator Header */}
      <div className={`flex items-center justify-between border-b border-rose-100 ${
        compact ? 'mb-2 pb-1.5' : 'mb-4 pb-2'
      }`}>
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all"
          title="Mês anterior"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="text-center">
          <h3 className={`font-serif-title font-bold text-stone-900 leading-tight capitalize ${
            compact ? 'text-sm' : 'text-base'
          }`}>
            {MONTH_NAMES_PT[currentMonth]} {currentYear}
          </h3>
          <p className="text-[10px] font-semibold text-rose-600">
            {isAdmin ? 'Toque no dia para ver os agendamentos' : 'Toque no dia desejado'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all"
          title="Próximo mês"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS_PT.map((day, idx) => (
          <span 
            key={idx} 
            className={`text-[10px] font-bold uppercase tracking-wider py-0.5 ${
              idx === 0 ? 'text-rose-400' : 'text-stone-500'
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="space-y-1">
        {matrix.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1">
            {week.map((item) => {
              const isSelected = selectedDate === item.dateKey;
              const isBlocked = !isAdmin && (item.isSunday || (!allowPast && item.isPast));
              const aptsForDay = appointmentsByDate[item.dateKey] || [];
              const countApts = aptsForDay.length;

              return (
                <button
                  type="button"
                  key={item.dateKey}
                  disabled={isBlocked}
                  onClick={() => onSelectDate(item.dateKey)}
                  className={`rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-95 text-center ${
                    compact ? 'min-h-[36px] py-0.5' : 'min-h-[46px] py-1'
                  } ${
                    isSelected
                      ? 'bg-rose-600 text-white font-extrabold shadow-sm scale-102 ring-2 ring-rose-300'
                      : !item.isCurrentMonth
                      ? 'text-stone-300 opacity-30 cursor-not-allowed'
                      : isBlocked
                      ? 'bg-stone-50 text-stone-300 cursor-not-allowed line-through'
                      : item.isToday
                      ? 'bg-rose-100/70 text-rose-900 font-bold border border-rose-300'
                      : 'bg-white hover:bg-rose-50 text-stone-800 font-semibold border border-rose-100'
                  }`}
                >
                  <span className={`text-xs ${isSelected ? 'text-white font-bold' : item.isToday ? 'text-rose-900' : ''}`}>
                    {item.dayNumber}
                  </span>

                  {/* Indicator for Admin or Client */}
                  {isAdmin ? (
                    countApts > 0 ? (
                      <span className={`text-[8px] font-extrabold px-1 rounded-full leading-tight ${
                        isSelected 
                          ? 'bg-white text-rose-700' 
                          : 'bg-rose-500 text-white'
                      }`}>
                        {countApts}v
                      </span>
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-stone-200 mt-0.5" />
                    )
                  ) : item.isSunday ? (
                    <span className="text-[7px] font-bold text-stone-400 leading-none">
                      fechado
                    </span>
                  ) : item.isToday ? (
                    <span className={`text-[7px] font-bold leading-none ${isSelected ? 'text-rose-100' : 'text-rose-600'}`}>
                      hoje
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
