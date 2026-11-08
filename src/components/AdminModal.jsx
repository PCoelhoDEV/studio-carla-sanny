import React, { useState } from 'react';
import { X, Save, Phone, MapPin, Trash2, CalendarCheck, Check } from 'lucide-react';
import { maskPhone } from '../utils/dateUtils';

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function AdminModal({ 
  isOpen, 
  onClose, 
  studioInfo, 
  onUpdateStudioInfo,
  appointments,
  onClearAppointments 
}) {
  if (!isOpen) return null;

  const [whatsapp, setWhatsapp] = useState(studioInfo.whatsapp || '5511999999999');
  const [name, setName] = useState(studioInfo.name || 'Studio Carla Sanny');
  const [instagram, setInstagram] = useState(studioInfo.instagram || 'studio_carlasanny');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const cleanNumber = whatsapp.replace(/\D/g, '');
    onUpdateStudioInfo({
      ...studioInfo,
      name,
      whatsapp: cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`,
      phoneDisplay: maskPhone(cleanNumber.startsWith('55') ? cleanNumber.slice(2) : cleanNumber),
      instagram: instagram.replace('@', '')
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto apple-shadow-lg border border-rose-100">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Área do Studio</h3>
            <p className="text-xs text-stone-500">Configurações para a Carla receber os agendamentos</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-rose-600" />
              <span>Número de WhatsApp da Carla:</span>
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 11987654321 ou 5511987654321"
              className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              É para este WhatsApp que o botão "Confirmar" enviará a mensagem pronta com todos os detalhes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1.5">
              <InstagramIcon className="w-4 h-4 text-rose-600" />
              <span>Instagram (sem @):</span>
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="studio_carlasanny"
              className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Nome do Salão:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </form>

        {/* History of appointments */}
        <div className="mt-6 pt-5 border-t border-rose-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-rose-500" />
              <span>Agendamentos neste aparelho ({appointments.length})</span>
            </h4>
            {appointments.length > 0 && (
              <button
                onClick={onClearAppointments}
                className="text-[11px] text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {appointments.length === 0 ? (
            <p className="text-xs text-stone-400 italic text-center py-2">
              Nenhum agendamento gravado ainda.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {appointments.map((item, idx) => (
                <div key={idx} className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-xs">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>{item.clientName}</span>
                    <span className="text-rose-600">{item.time}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {item.date} • {item.services?.map(s => s.name).join(', ')}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    WhatsApp: {item.clientPhone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
