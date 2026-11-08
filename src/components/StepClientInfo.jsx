import React from 'react';
import { User, Phone, MessageSquare, ArrowLeft, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { maskPhone, formatFullDatePortuguese, formatCurrency } from '../utils/dateUtils';

export default function StepClientInfo({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  notes,
  setNotes,
  selectedServices,
  selectedDate,
  selectedTime,
  onBack,
  onNext,
  largeTextMode
}) {
  const totalAmount = selectedServices.reduce((acc, curr) => acc + curr.price, 0);

  const isValid = clientName.trim().length >= 2 && clientPhone.replace(/\D/g, '').length >= 10;

  return (
    <div className="pb-32 px-4">
      {/* Title */}
      <div className="mb-4">
        <h2 className={`font-bold text-stone-900 ${largeTextMode ? 'text-xl' : 'text-lg'}`}>
          3. Preencha seus dados para contato
        </h2>
        <p className="text-stone-500 text-xs mt-0.5">
          A Carla precisa do seu nome e telefone para reservar seu horário com carinho.
        </p>
      </div>

      {/* Summary Recap Badge */}
      <div className="bg-rose-50/60 border border-rose-200/70 rounded-2xl p-3.5 mb-5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">Agendamento para:</span>
          <span className="font-bold text-rose-700">{formatFullDatePortuguese(selectedDate)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">Horário:</span>
          <span className="font-bold text-stone-800 text-sm">{selectedTime}</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-rose-200/50">
          <span className="text-stone-500">Serviço(s): {selectedServices.map(s => s.name).join(', ')}</span>
          <span className="font-extrabold text-stone-900 text-sm">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-stone-800 font-bold mb-1.5 flex items-center gap-1.5 text-sm">
            <User className="w-4 h-4 text-rose-600" />
            <span>Qual é o seu Nome Completo?</span>
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex: Maria de Fátima Silva"
            className={`w-full bg-white border-2 rounded-2xl px-4 py-3.5 text-stone-900 transition-all outline-none ${
              clientName.trim().length >= 2
                ? 'border-rose-400 focus:border-rose-600 shadow-xs'
                : 'border-rose-200 focus:border-rose-400'
            } ${largeTextMode ? 'text-lg' : 'text-base'}`}
          />
        </div>

        {/* WhatsApp Input */}
        <div>
          <label className="block text-stone-800 font-bold mb-1.5 flex items-center gap-1.5 text-sm">
            <Phone className="w-4 h-4 text-rose-600" />
            <span>Seu WhatsApp ou Celular com DDD:</span>
          </label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(maskPhone(e.target.value))}
            placeholder="(11) 98765-4321"
            maxLength={15}
            className={`w-full bg-white border-2 rounded-2xl px-4 py-3.5 text-stone-900 transition-all outline-none ${
              clientPhone.replace(/\D/g, '').length >= 10
                ? 'border-rose-400 focus:border-rose-600 shadow-xs'
                : 'border-rose-200 focus:border-rose-400'
            } ${largeTextMode ? 'text-lg' : 'text-base'}`}
          />
          <span className="text-[11px] text-stone-500 mt-1 block">
            Usaremos apenas para confirmar e enviar o lembrete do horário.
          </span>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-stone-800 font-medium mb-1.5 flex items-center gap-1.5 text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            <span>Observação ou preferência (Opcional):</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex: Unha encravada no dedão, prefiro cor clara..."
            className="w-full bg-white border border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-stone-800 text-sm outline-none resize-none"
          />
        </div>

        {/* Reassurance badge for elderly clients */}
        <div className="bg-white rounded-2xl p-3.5 border border-rose-100 flex items-start gap-3 apple-shadow">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-stone-800 text-xs">Sem pagamento online</p>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Você não precisa passar cartão ou pagar nada pelo site. O pagamento é feito pessoalmente no dia com a Carla!
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
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
            disabled={!isValid}
            className={`flex-1 min-h-[56px] px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
              isValid
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            } ${largeTextMode ? 'text-base' : 'text-sm'}`}
          >
            <span>Revisar e Finalizar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
