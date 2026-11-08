import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CalendarView from './components/CalendarView';
import { INITIAL_SERVICES, INITIAL_STUDIO_INFO } from './data/initialData';
import { 
  formatCurrency, 
  formatDuration,
  formatFullDatePortuguese, 
  maskPhone, 
  buildWhatsAppLink 
} from './utils/dateUtils';
import { 
  getSlotAvailability,
  timeToMinutes,
  minutesToTime
} from './utils/timeSlots';
import { 
  Check, 
  Plus,
  Clock, 
  User, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'podologia', label: '🦶 Podologia' },
  { id: 'manicure', label: '💅 Manicure & Unhas' },
  { id: 'sobrancelhas', label: '✨ Sobrancelhas' },
  { id: 'depilacao', label: '🌿 Depilação' },
];

export default function App() {
  const [studioInfo] = useState(() => {
    const saved = localStorage.getItem('studio_carla_info');
    return saved ? JSON.parse(saved) : INITIAL_STUDIO_INFO;
  });

  const [step, setStep] = useState(1); // 1: Serviço, 2: Data/Hora, 3: Dados, 4: Confirmação
  const [activeCategory, setActiveCategory] = useState('podologia');

  // MULTIPLE SERVICES SELECTION
  const [selectedServices, setSelectedServices] = useState([INITIAL_SERVICES[0]]);

  // Selected Date & Time
  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    if (now.getDay() === 0) {
      now.setDate(now.getDate() + 1);
      return now.toISOString().split('T')[0];
    }
    return todayKey;
  });

  const [selectedTime, setSelectedTime] = useState('08:30');

  // Client Info
  const [clientName, setClientName] = useState(() => localStorage.getItem('client_name') || '');
  const [clientPhone, setClientPhone] = useState(() => localStorage.getItem('client_phone') || '');

  // Filter services by category
  const categoryServices = INITIAL_SERVICES.filter(s => s.category === activeCategory);

  // Totals calculations
  const totalAmount = selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.duration, 0);
  const formattedDate = formatFullDatePortuguese(selectedDate);

  // Load appointments from localStorage to calculate exact overlaps
  const [existingAppointments, setExistingAppointments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studio_carla_appointments') || '[]');
    } catch {
      return [];
    }
  });

  // Re-read fresh appointments when entering step 2 or changing date
  useEffect(() => {
    try {
      const fresh = JSON.parse(localStorage.getItem('studio_carla_appointments') || '[]');
      setExistingAppointments(fresh);
    } catch {
      // ignore
    }
  }, [step, selectedDate]);

  // Compute availability for every slot considering totalDuration of chosen services
  const slotAvailability = useMemo(() => {
    return getSlotAvailability({
      dateKey: selectedDate,
      durationNeeded: totalDuration || 30,
      existingAppointments
    });
  }, [selectedDate, totalDuration, existingAppointments]);

  // Ensure selectedTime is valid & available
  useEffect(() => {
    const isCurrentTimeAvailable = slotAvailability.some(s => s.time === selectedTime && s.isAvailable);
    if (!isCurrentTimeAvailable) {
      const firstFree = slotAvailability.find(s => s.isAvailable);
      if (firstFree) {
        setSelectedTime(firstFree.time);
      } else {
        setSelectedTime('');
      }
    }
  }, [selectedDate, totalDuration, slotAvailability, selectedTime]);

  // Calculate end time
  const calculatedEndTime = useMemo(() => {
    if (!selectedTime || !totalDuration) return '';
    const startMins = timeToMinutes(selectedTime);
    return minutesToTime(startMins + totalDuration);
  }, [selectedTime, totalDuration]);

  // Toggle multi-selection (permite desmarcar tudo se quiser)
  const handleToggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const isFormValid = clientName.trim().length >= 2 && clientPhone.replace(/\D/g, '').length >= 10;

  const handleFinish = () => {
    if (!isFormValid || selectedServices.length === 0 || !selectedTime) return;

    localStorage.setItem('client_name', clientName);
    localStorage.setItem('client_phone', clientPhone);

    const newBooking = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      date: selectedDate,
      time: selectedTime,
      duration: totalDuration,
      endTime: calculatedEndTime,
      services: selectedServices,
      notes: '',
      status: 'confirmado'
    };

    const existing = JSON.parse(localStorage.getItem('studio_carla_appointments') || '[]');
    const updated = [newBooking, ...existing];
    localStorage.setItem('studio_carla_appointments', JSON.stringify(updated));
    setExistingAppointments(updated);

    setStep(4);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F43F5E', '#FB7185', '#FDA4AF']
      });
    } catch (e) {
      // ignore
    }
  };

  const whatsAppLink = buildWhatsAppLink({
    studioPhone: studioInfo.whatsapp,
    clientName,
    clientPhone,
    services: selectedServices,
    dateKey: selectedDate,
    time: `${selectedTime} às ${calculatedEndTime}`,
    notes: ''
  });

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col justify-between overflow-hidden bg-[#FFF5F7] select-none text-stone-900">
      
      {/* ============================================================== */}
      {/* 1. COMPACT APPLE-STYLE HEADER */}
      {/* ============================================================== */}
      <header className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between border-b border-rose-100/70 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-rose-400 to-pink-300 shadow-xs">
            <img
              src="/carla-profile.jpg"
              alt="Carla Sanny"
              className="w-full h-full object-cover rounded-full bg-white"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80";
              }}
            />
          </div>
          <div>
            <h1 className="font-serif-title font-bold text-stone-900 text-sm leading-tight">
              {studioInfo.name}
            </h1>
            <p className="text-[10px] text-rose-600 font-semibold leading-none">
              Agendamento Online
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {step <= 3 && (
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-200">
              Etapa {step} de 3
            </span>
          )}
          <Link
            to="/cbarbosa"
            className="w-8 h-8 rounded-full bg-white border border-rose-200 text-stone-600 flex items-center justify-center hover:bg-rose-50 shadow-xs"
            title="Área da Carla (Admin)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. CENTERED CONTENT PER STEP (NO AWKWARD SCROLLING) */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col justify-center px-4 py-2 overflow-y-auto no-scrollbar">

        {/* ------------------------------------------------------------ */}
        {/* STEP 1: ESCOLHA DE SERVIÇOS (COM SUPORTE A MÚLTIPLOS) */}
        {/* ------------------------------------------------------------ */}
        {step === 1 && (
          <div className="space-y-2.5 animate-fade-in my-auto">
            <div className="text-center">
              <h2 className="font-serif-title font-bold text-stone-900 text-base sm:text-lg">
                O que você gostaria de fazer?
              </h2>
              <p className="text-stone-500 text-[11px]">
                Você pode selecionar mais de um serviço se desejar:
              </p>
            </div>

            {/* Real-time multi-selection summary badge */}
            <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl px-3 py-1.5 flex items-center justify-between text-xs shadow-2xs">
              {selectedServices.length > 0 ? (
                <>
                  <span className="font-bold text-rose-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedServices.length} {selectedServices.length === 1 ? 'serviço escolhido' : 'serviços escolhidos'}</span>
                  </span>
                  <div className="flex items-center gap-2 font-extrabold text-stone-900">
                    <span className="text-rose-600 text-[11px] font-semibold flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDuration(totalDuration)}
                    </span>
                    <span>•</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-bold text-stone-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-stone-400" />
                    <span>Nenhum serviço selecionado</span>
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600">
                    Toque para escolher
                  </span>
                </>
              )}
            </div>

            {/* Category horizontal selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                const countInCat = selectedServices.filter(s => s.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-stone-700 border-rose-200/80 hover:bg-rose-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {countInCat > 0 && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-rose-700' : 'bg-rose-500 text-white'
                      }`}>
                        {countInCat}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Services Options (Large cards, easy to tap) */}
            <div className="space-y-2 max-h-[44vh] overflow-y-auto pr-0.5 no-scrollbar">
              {categoryServices.map(srv => {
                const isSelected = selectedServices.some(s => s.id === srv.id);

                return (
                  <div
                    key={srv.id}
                    onClick={() => handleToggleService(srv)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-1 ring-rose-200'
                        : 'border-rose-100 hover:border-rose-200 bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-sm leading-tight">
                          {srv.name}
                        </h3>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5 leading-snug line-clamp-2">
                        {srv.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(srv.duration)}
                        </span>
                        <span className="text-sm font-extrabold text-stone-900">
                          {formatCurrency(srv.price)}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs scale-105'
                          : 'bg-stone-100 text-stone-400 border border-stone-200 hover:bg-rose-100 hover:text-rose-600'
                      }`}>
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 2: ESCOLHA DA DATA E HORÁRIO (COM BLOQUEIO REAL DE DURAÇÃO) */}
        {/* ------------------------------------------------------------ */}
        {step === 2 && (
          <div className="space-y-2 animate-fade-in my-auto">
            <div className="text-center">
              <h2 className="font-serif-title font-bold text-stone-900 text-base sm:text-lg">
                Escolha o Dia e o Horário
              </h2>
              {/* Summary of chosen services */}
              <div className="text-stone-500 text-[11px] flex items-center justify-center gap-1.5 mt-0.5">
                <span>{selectedServices.length} {selectedServices.length === 1 ? 'serviço' : 'serviços'}</span>
                <span>•</span>
                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  Duração: {formatDuration(totalDuration)}
                </span>
                <span>•</span>
                <strong className="text-stone-900">{formatCurrency(totalAmount)}</strong>
              </div>
            </div>

            {/* Compact Calendar */}
            <CalendarView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              isAdmin={false}
              compact={true}
            />

            {/* Time Slots Area */}
            <div className="bg-white rounded-2xl p-2.5 border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 px-1">
                <span>Horários disponíveis ({formattedDate.split(',')[0]}):</span>
                {selectedTime ? (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 font-extrabold text-[11px]">
                    {selectedTime} às {calculatedEndTime}
                  </span>
                ) : (
                  <span className="text-stone-400 font-medium">Selecione</span>
                )}
              </div>

              {/* Dynamic Slots Grid with accurate overlap blocking */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-[22vh] overflow-y-auto pr-0.5 no-scrollbar">
                {slotAvailability.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  
                  if (!slot.isAvailable) {
                    return (
                      <div
                        key={slot.time}
                        className="min-h-[38px] rounded-xl flex flex-col items-center justify-center bg-stone-100 border border-stone-200/80 text-stone-400 opacity-60 cursor-not-allowed text-center select-none py-0.5"
                        title={slot.reason}
                      >
                        <span className="text-xs line-through">{slot.time}</span>
                        <span className="text-[8px] font-bold text-rose-500/80 leading-none">ocupado</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`min-h-[38px] rounded-xl font-bold text-xs transition-all active:scale-95 border flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-rose-300'
                      }`}
                    >
                      <span>{slot.time}</span>
                    </button>
                  );
                })}
              </div>

              {/* Clarification banner */}
              {selectedTime ? (
                <div className="bg-rose-50/70 rounded-xl p-1.5 text-center text-[10px] text-rose-800 font-medium border border-rose-100/60">
                  Reservando das <strong>{selectedTime}</strong> até <strong>{calculatedEndTime}</strong> ({formatDuration(totalDuration)}) sem sobreposição! ✨
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-1.5 text-center text-[10px] text-amber-800 font-medium border border-amber-200/60 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Nenhum horário livre com duração de {formatDuration(totalDuration)} neste dia. Toque em outro dia no calendário!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 3: SEUS DADOS */}
        {/* ------------------------------------------------------------ */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in my-auto">
            <div className="text-center">
              <h2 className="font-serif-title font-bold text-stone-900 text-lg sm:text-xl">
                Como a Carla pode te chamar?
              </h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Para reservar seus horários com carinho na agenda:
              </p>
            </div>

            {/* Multi-services recap card */}
            <div className="bg-white rounded-2xl p-3 border border-rose-100 shadow-xs text-xs space-y-1.5">
              <div className="flex justify-between items-center text-stone-500 pb-1 border-b border-rose-50">
                <span>Data & Horário:</span>
                <span className="font-bold text-rose-700">{formattedDate} ({selectedTime} às {calculatedEndTime})</span>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                  Serviços Selecionados ({selectedServices.length}):
                </p>
                <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                  {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between text-[11px]">
                      <span className="font-semibold text-stone-800">• {s.name} ({formatDuration(s.duration)})</span>
                      <span className="font-bold text-stone-700">{formatCurrency(s.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-1.5 border-t border-rose-100 font-bold">
                <span className="text-stone-600 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-rose-500" />
                  Duração Total: {formatDuration(totalDuration)}
                </span>
                <span className="text-stone-900 text-sm">Total: {formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-rose-600" />
                <span>Seu Nome Completo:</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Dona Maria Silva"
                className="w-full bg-white border-2 border-rose-200 focus:border-rose-600 rounded-2xl px-4 py-3 text-stone-900 text-sm font-semibold outline-none shadow-xs"
              />
            </div>

            {/* WhatsApp Input */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-rose-600" />
                <span>Seu WhatsApp com DDD:</span>
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(maskPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                maxLength={15}
                className="w-full bg-white border-2 border-rose-200 focus:border-rose-600 rounded-2xl px-4 py-3 text-stone-900 text-sm font-semibold outline-none shadow-xs"
              />
            </div>

            {/* Reassurance */}
            <div className="bg-emerald-50 rounded-2xl p-2.5 border border-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-[11px] text-emerald-900 font-medium leading-tight">
                Sem pagamento online. O valor é pago pessoalmente no salão no dia!
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 4: COMPROVANTE & AQUI SIM ENTRA O BOTÃO WHATSAPP! */}
        {/* ------------------------------------------------------------ */}
        {step === 4 && (
          <div className="space-y-3.5 animate-fade-in my-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-green-400 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-200">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h2 className="font-serif-title font-bold text-stone-900 text-lg leading-tight">
                Horário Pré-Agendado!
              </h2>
              <p className="text-stone-600 text-xs mt-0.5">
                Agora é só tocar no botão verde abaixo para enviar à Carla:
              </p>
            </div>

            {/* Apple Ticket */}
            <div className="bg-white rounded-2xl border border-rose-200/90 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-2.5 text-white text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Comprovante de Reserva</p>
                <p className="font-serif-title font-bold text-sm">{studioInfo.name}</p>
              </div>

              <div className="p-3.5 space-y-2 text-xs">
                <div className="bg-rose-50/80 rounded-xl p-2.5 border border-rose-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase font-semibold">Dia Escolhido</p>
                    <p className="font-bold text-stone-900 text-xs">{formattedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-stone-500 uppercase font-semibold">Horário Reservado</p>
                    <p className="font-extrabold text-rose-600 text-sm">{selectedTime} às {calculatedEndTime}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Cliente:</span>
                    <span className="font-bold">{clientName}</span>
                  </div>

                  <div className="pt-1 border-t border-rose-50">
                    <p className="text-[10px] font-bold uppercase text-stone-400 mb-0.5">Serviços:</p>
                    {selectedServices.map(s => (
                      <div key={s.id} className="flex justify-between text-[11px] py-0.5">
                        <span className="font-medium">• {s.name} ({formatDuration(s.duration)})</span>
                        <span className="font-bold text-stone-800">{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-1.5 border-t border-rose-100 font-bold items-center">
                    <span className="text-stone-500 text-[11px]">
                      Duração Total: {formatDuration(totalDuration)}
                    </span>
                    <span className="text-base text-stone-900 font-extrabold">
                      Total: {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* GIANT GREEN WHATSAPP BUTTON (ONLY HERE!) */}
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[56px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-98 transition-all text-base animate-pulse"
            >
              <MessageCircle className="w-6 h-6 fill-white stroke-emerald-600" />
              <span>Confirmar no WhatsApp da Carla</span>
            </a>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-center text-xs font-bold text-rose-600 hover:underline flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Alterar ou Agendar Novo Horário</span>
            </button>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 3. BOTTOM FIXED NAVIGATION BAR (ONLY "PRÓXIMO" / "VOLTAR") */}
      {/* ============================================================== */}
      {step <= 3 && (
        <footer className="shrink-0 p-3 bg-white/90 backdrop-blur-md border-t border-rose-100 flex items-center justify-between gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="min-h-[50px] px-4 rounded-2xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : selectedServices.length > 0 ? (
            <div className="text-[11px] font-bold text-rose-700 pl-2">
              {selectedServices.length} {selectedServices.length === 1 ? 'item' : 'itens'} • {formatCurrency(totalAmount)}
            </div>
          ) : (
            <div className="text-[11px] font-semibold text-stone-400 pl-2">
              Selecione 1 serviço
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (step === 1 && selectedServices.length > 0) setStep(2);
              else if (step === 2 && selectedTime) setStep(3);
              else if (step === 3) handleFinish();
            }}
            disabled={
              (step === 1 && selectedServices.length === 0) || 
              (step === 2 && !selectedTime) ||
              (step === 3 && !isFormValid)
            }
            className={`flex-1 min-h-[50px] px-4 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm ${
              (step === 1 && selectedServices.length === 0) || 
              (step === 2 && !selectedTime) ||
              (step === 3 && !isFormValid)
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed text-xs'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white cursor-pointer text-xs sm:text-sm'
            }`}
          >
            <span>
              {step === 1 && (
                selectedServices.length > 0
                  ? `Continuar (${formatDuration(totalDuration)})`
                  : 'Escolha ao menos 1 serviço'
              )}
              {step === 2 && (
                selectedTime 
                  ? `Confirmar ${selectedTime} às ${calculatedEndTime}` 
                  : 'Escolha um horário livre'
              )}
              {step === 3 && 'Finalizar Agendamento'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </footer>
      )}

    </div>
  );
}
