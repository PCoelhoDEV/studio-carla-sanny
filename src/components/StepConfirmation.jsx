import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  MessageCircle, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  MapPin
} from 'lucide-react';
import { 
  formatCurrency, 
  formatFullDatePortuguese, 
  buildWhatsAppLink 
} from '../utils/dateUtils';

export default function StepConfirmation({
  clientName,
  clientPhone,
  selectedServices,
  selectedDate,
  selectedTime,
  notes,
  studioInfo,
  onReset,
  largeTextMode
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch festive confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#FDE047']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const totalAmount = selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.duration, 0);
  const formattedDate = formatFullDatePortuguese(selectedDate);

  const whatsAppLink = buildWhatsAppLink({
    studioPhone: studioInfo.whatsapp,
    clientName,
    clientPhone,
    services: selectedServices,
    dateKey: selectedDate,
    time: selectedTime,
    notes
  });

  const handleCopySummary = () => {
    const text = `Agendamento no ${studioInfo.name}\n` +
      `Cliente: ${clientName} (${clientPhone})\n` +
      `Data: ${formattedDate} às ${selectedTime}\n` +
      `Serviços: ${selectedServices.map(s => s.name).join(', ')}\n` +
      `Total estimado: ${formatCurrency(totalAmount)}`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="pb-16 px-4">
      {/* Top Success Badge */}
      <div className="text-center mb-5">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-green-400 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
        <h2 className={`font-serif-title font-bold text-stone-900 ${largeTextMode ? 'text-2xl' : 'text-xl'}`}>
          Quase pronto, {clientName.split(' ')[0]}!
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
          Para confirmar e garantir seu horário na agenda, toque no botão verde abaixo para enviar no WhatsApp da Carla.
        </p>
      </div>

      {/* Main Apple-style Ticket Card */}
      <div className="bg-white rounded-3xl border border-rose-200/80 shadow-xl overflow-hidden relative mb-5">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-4 text-white text-center relative">
          <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">Comprovante de Reserva</p>
          <p className="font-serif-title font-bold text-lg mt-0.5">{studioInfo.name}</p>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Date & Time Highlight */}
          <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-stone-500 font-semibold uppercase">Dia Escolhido</p>
                <p className="font-bold text-stone-900 text-sm">{formattedDate}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-stone-500 font-semibold uppercase">Horário</p>
              <p className="font-extrabold text-rose-600 text-lg">{selectedTime}</p>
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span className="font-medium text-stone-500">Nome:</span>
              <span className="font-bold text-stone-800">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-stone-500">Telefone:</span>
              <span className="font-bold text-stone-800">{clientPhone}</span>
            </div>
            {notes && (
              <div className="flex justify-between">
                <span className="font-medium text-stone-500">Obs:</span>
                <span className="text-stone-800 text-right">{notes}</span>
              </div>
            )}
          </div>

          {/* Perforated separator */}
          <div className="relative py-2">
            <div className="border-b-2 border-dashed border-rose-200" />
            <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFF5F7] rounded-full border-r border-rose-200" />
            <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFF5F7] rounded-full border-l border-rose-200" />
          </div>

          {/* Selected Services breakdown */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Serviços Selecionados:
            </p>
            <div className="space-y-2">
              {selectedServices.map(service => (
                <div key={service.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-stone-800">{service.name}</span>
                  </div>
                  <span className="font-bold text-stone-700">{formatCurrency(service.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-rose-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-stone-500 font-semibold uppercase">Total Estimado</p>
              <p className="text-[10px] text-rose-500 font-medium">Tempo: ~{totalDuration} min</p>
            </div>
            <p className="text-2xl font-extrabold text-stone-900">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* GIANT WHATSAPP CONFIRMATION BUTTON */}
      <div className="space-y-3">
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[64px] py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 active:scale-98 transition-all text-base sm:text-lg animate-pulse"
        >
          <MessageCircle className="w-7 h-7 fill-white stroke-emerald-600" />
          <span>Confirmar no WhatsApp da Carla</span>
        </a>

        <p className="text-center text-[11px] text-stone-500 leading-tight">
          Ao clicar, a mensagem pronta será aberta no WhatsApp da Carla para ela aprovar seu horário.
        </p>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleCopySummary}
            className="py-3 px-3 rounded-2xl bg-white border border-rose-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 active:scale-95 transition-all shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-rose-500" />}
            <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>

          <button
            onClick={onReset}
            className="py-3 px-3 rounded-2xl bg-white border border-rose-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 active:scale-95 transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
