import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  User, 
  AlertCircle, 
  Plus, 
  Search, 
  Settings, 
  ArrowLeft, 
  MessageSquare, 
  Trash2, 
  Save, 
  TrendingUp, 
  ChevronRight, 
  Check, 
  X,
  ExternalLink,
  CalendarDays
} from 'lucide-react';
import CalendarView from '../components/CalendarView';
import { INITIAL_STUDIO_INFO, INITIAL_SERVICES } from '../data/initialData';
import { formatCurrency, formatDuration, formatFullDatePortuguese, maskPhone } from '../utils/dateUtils';
import { timeToMinutes, minutesToTime } from '../utils/timeSlots';

// Seed realistic sample appointments if empty
const DEFAULT_SAMPLE_APPOINTMENTS = [
  {
    id: 101,
    createdAt: new Date().toISOString(),
    clientName: 'Dona Helena Ribeiro',
    clientPhone: '(11) 98123-4567',
    date: new Date().toISOString().split('T')[0], // Today
    time: '09:30',
    status: 'confirmado',
    services: [INITIAL_SERVICES[0]],
    notes: 'Unhas sensíveis, tem preferência por atendimento calmo.'
  },
  {
    id: 102,
    createdAt: new Date().toISOString(),
    clientName: 'Mariana Souza',
    clientPhone: '(11) 99876-1234',
    date: new Date().toISOString().split('T')[0], // Today
    time: '14:30',
    status: 'confirmado',
    services: [INITIAL_SERVICES[2]],
    notes: 'Esmalte vermelho clássico.'
  },
  {
    id: 103,
    createdAt: new Date().toISOString(),
    clientName: 'Dona Carmen Silveira',
    clientPhone: '(11) 97654-3210',
    date: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    time: '10:30',
    status: 'pendente',
    services: [INITIAL_SERVICES[1], INITIAL_SERVICES[7]],
    notes: 'Primeira vez no salão.'
  }
];

export default function AdminPage() {
  const [studioInfo, setStudioInfo] = useState(() => {
    const saved = localStorage.getItem('studio_carla_info');
    return saved ? JSON.parse(saved) : INITIAL_STUDIO_INFO;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('studio_carla_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_SAMPLE_APPOINTMENTS;
  });

  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayKey);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  // Settings Form State
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(studioInfo.whatsapp);
  const [settingsName, setSettingsName] = useState(studioInfo.name);
  const [settingsInstagram, setSettingsInstagram] = useState(studioInfo.instagram);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // New Appointment Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newDate, setNewDate] = useState(todayKey);
  const [newTime, setNewTime] = useState('09:30');
  const [newSelectedServices, setNewSelectedServices] = useState([INITIAL_SERVICES[0]]);
  const [newNotes, setNewNotes] = useState('');

  // Persist
  useEffect(() => {
    localStorage.setItem('studio_carla_info', JSON.stringify(studioInfo));
  }, [studioInfo]);

  useEffect(() => {
    localStorage.setItem('studio_carla_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Group appointments by date for calendar dots
  const appointmentsByDate = useMemo(() => {
    const map = {};
    appointments.forEach(apt => {
      if (!map[apt.date]) map[apt.date] = [];
      map[apt.date].push(apt);
    });
    return map;
  }, [appointments]);

  // Day specific appointments
  const selectedDayAppointments = useMemo(() => {
    return (appointmentsByDate[selectedCalendarDate] || []).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointmentsByDate, selectedCalendarDate]);

  // All filtered if searching
  const searchedAppointments = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return appointments.filter(apt => 
      (apt.clientName || '').toLowerCase().includes(q) || 
      (apt.clientPhone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );
  }, [appointments, searchQuery]);

  // KPIs for the selected day
  const dayRevenue = selectedDayAppointments
    .filter(a => a.status !== 'cancelado')
    .reduce((acc, curr) => {
      const sTotal = (curr.services || []).reduce((sAcc, s) => sAcc + (s.price || 0), 0);
      return acc + sTotal;
    }, 0);

  const handleUpdateStatus = (id, newStatus) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) return { ...apt, status: newStatus };
      return apt;
    }));
  };

  const handleDeleteAppointment = (id) => {
    if (window.confirm('Tem certeza que deseja apagar este agendamento?')) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const cleanNumber = settingsWhatsapp.replace(/\D/g, '');
    const updated = {
      ...studioInfo,
      name: settingsName,
      whatsapp: cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`,
      phoneDisplay: maskPhone(cleanNumber.startsWith('55') ? cleanNumber.slice(2) : cleanNumber),
      instagram: settingsInstagram.replace('@', '')
    };
    setStudioInfo(updated);
    setSettingsSavedMessage(true);
    setTimeout(() => {
      setSettingsSavedMessage(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim() || newSelectedServices.length === 0) {
      alert('Por favor, preencha o nome, telefone e escolha ao menos um serviço.');
      return;
    }

    const duration = newSelectedServices.reduce((acc, s) => acc + (s.duration || 60), 0) || 60;
    const startMins = timeToMinutes(newTime);
    const endTime = minutesToTime(startMins + duration);

    const created = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      clientName: newClientName.trim(),
      clientPhone: maskPhone(newClientPhone),
      date: newDate,
      time: newTime,
      duration,
      endTime,
      status: 'confirmado',
      services: newSelectedServices,
      notes: newNotes.trim()
    };

    setAppointments(prev => [created, ...prev]);
    setSelectedCalendarDate(newDate);
    setIsNewAppointmentOpen(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewNotes('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'pendente':
        return { label: 'Pendente', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'concluido':
        return { label: 'Atendido', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'cancelado':
        return { label: 'Cancelado', bg: 'bg-stone-100 text-stone-500 border-stone-200' };
      default:
        return { label: status, bg: 'bg-stone-50 text-stone-600 border-stone-200' };
    }
  };

  const renderAppointmentCard = (apt) => {
    const badge = getStatusBadge(apt.status);
    const serviceTotal = (apt.services || []).reduce((acc, s) => acc + (s.price || 0), 0);
    const duration = apt.duration || (apt.services || []).reduce((acc, s) => acc + (s.duration || 60), 0) || 60;
    const startMins = timeToMinutes(apt.time);
    const calculatedEnd = apt.endTime || minutesToTime(startMins + duration);

    const cleanClientPhone = (apt.clientPhone || '').replace(/\D/g, '');
    const clientWhatsAppUrl = `https://wa.me/55${cleanClientPhone}?text=${encodeURIComponent(
      `Olá ${apt.clientName}! Aqui é a Carla do Studio Carla Sanny. Passando para confirmar seu horário no dia ${formatFullDatePortuguese(apt.date)} das ${apt.time} às ${calculatedEnd}. Tudo confirmado com você? 💕`
    )}`;

    return (
      <div
        key={apt.id}
        className="bg-white rounded-2xl p-4 border border-rose-100 apple-shadow transition-all"
      >
        {/* Top row */}
        <div className="flex items-center justify-between pb-2.5 border-b border-rose-50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{apt.time} às {calculatedEnd}</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
              {formatDuration(duration)}
            </span>
          </div>

          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {/* Middle row */}
        <div className="py-2.5">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="font-bold text-stone-900 text-base leading-tight">
                {apt.clientName}
              </h4>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-rose-500" />
                <span>{apt.clientPhone}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-stone-900">
                {formatCurrency(serviceTotal)}
              </span>
            </div>
          </div>

          {/* Services list */}
          <div className="flex flex-wrap gap-1 mt-2">
            {(apt.services || []).map((srv, idx) => (
              <span
                key={idx}
                className="bg-rose-50 text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg border border-rose-100"
              >
                {srv.name}
              </span>
            ))}
          </div>

          {apt.notes && (
            <div className="mt-2 text-[11px] bg-stone-50 text-stone-600 p-2 rounded-xl border border-stone-200/60 flex items-start gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>Obs: {apt.notes}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2.5 border-t border-rose-50 flex items-center justify-between gap-2">
          <a
            href={clientWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 fill-white" />
            <span>Chamar no WhatsApp</span>
          </a>

          <div className="flex items-center gap-1">
            {apt.status !== 'concluido' && (
              <button
                onClick={() => handleUpdateStatus(apt.id, 'concluido')}
                className="px-2 py-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold"
              >
                Atendido ✓
              </button>
            )}

            <button
              onClick={() => handleDeleteAppointment(apt.id)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Apagar agendamento"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-stone-900 pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-rose-100 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center hover:bg-rose-100 transition-transform active:scale-95"
              title="Voltar ao Site das Clientes"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif-title font-bold text-stone-900 text-lg leading-none">
                  Painel da Carla
                </h1>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  CALENDÁRIO
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {studioInfo.name} • {studioInfo.phoneDisplay}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-9 h-9 rounded-full bg-white border border-rose-200 text-stone-700 flex items-center justify-center hover:bg-rose-50 active:scale-95 shadow-xs"
              title="Configurações do WhatsApp"
            >
              <Settings className="w-4 h-4" />
            </button>
            <Link
              to="/"
              target="_blank"
              className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center hover:bg-rose-100 active:scale-95 shadow-xs"
              title="Abrir Site da Cliente"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* WhatsApp Setup Banner if default */}
        {studioInfo.whatsapp.includes('999999999') && (
          <div 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3 cursor-pointer hover:bg-amber-100/70 transition-all shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-900">Configure o seu WhatsApp oficial!</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Clique aqui para cadastrar seu número onde as clientes enviarão o agendamento.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-500 shrink-0 self-center" />
          </div>
        )}

        {/* CALENDAR AT TOP (Visual Month Overview) */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Calendário da Carla (Visão Geral)
              </h2>
            </div>
            <button
              onClick={() => setSelectedCalendarDate(todayKey)}
              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Ir para Hoje
            </button>
          </div>

          <CalendarView
            selectedDate={selectedCalendarDate}
            onSelectDate={setSelectedCalendarDate}
            isAdmin={true}
            appointmentsByDate={appointmentsByDate}
            allowPast={true}
          />
        </section>

        {/* Selected Day Header & Day KPIs */}
        <div className="bg-white rounded-2xl p-3.5 border border-rose-100 apple-shadow flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-rose-600">Dia Selecionado no Calendário:</p>
            <p className="font-serif-title font-bold text-stone-900 text-sm sm:text-base">
              {formatFullDatePortuguese(selectedCalendarDate)}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {selectedDayAppointments.length} agendamento(s) marcados
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-stone-400">Estimado do Dia:</p>
            <p className="text-lg font-extrabold text-emerald-700 leading-tight">
              {formatCurrency(dayRevenue)}
            </p>
          </div>
        </div>

        {/* Action Button: Add Appointment */}
        <button
          onClick={() => {
            setNewDate(selectedCalendarDate);
            setIsNewAppointmentOpen(true);
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Agendar Cliente neste Dia</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente por nome ou telefone em qualquer dia..."
            className="w-full bg-white border border-rose-200/80 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-stone-900 outline-none focus:border-rose-400 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Appointments List for the selected day (or search results) */}
        <div className="space-y-3">
          {searchQuery.trim() ? (
            /* Search Results */
            <>
              <p className="text-xs font-bold text-stone-600 uppercase">
                Resultados da Busca ({searchedAppointments.length}):
              </p>
              {searchedAppointments.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-xs text-stone-400">
                  Nenhum agendamento encontrado com essa busca.
                </div>
              ) : (
                searchedAppointments.map(apt => renderAppointmentCard(apt))
              )}
            </>
          ) : (
            /* Day Specific Appointments */
            <>
              {selectedDayAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-rose-100 apple-shadow">
                  <Clock className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                  <h3 className="font-bold text-stone-800 text-sm">
                    Nenhum horário marcado para este dia
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Toque no botão acima para adicionar uma cliente manualmente se ela te ligar.
                  </p>
                </div>
              ) : (
                selectedDayAppointments.map(apt => renderAppointmentCard(apt))
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL: Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto apple-shadow-lg border border-rose-100">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Configurações do Studio</h3>
                <p className="text-xs text-stone-500">Defina o WhatsApp onde você quer receber os agendamentos</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>Seu WhatsApp Comercial (com DDD):</span>
                </label>
                <input
                  type="text"
                  value={settingsWhatsapp}
                  onChange={(e) => setSettingsWhatsapp(e.target.value)}
                  placeholder="Ex: 11987654321 ou 5511987654321"
                  className="w-full bg-stone-50 border-2 border-stone-200 focus:border-rose-500 rounded-2xl px-4 py-3 text-base text-stone-900 font-semibold outline-none"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  É para este número que o botão verde de confirmação vai abrir a mensagem das clientes.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1.5">
                  Nome do Salão:
                </label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2.5 text-sm text-stone-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1.5">
                  Instagram (sem @):
                </label>
                <input
                  type="text"
                  value={settingsInstagram}
                  onChange={(e) => setSettingsInstagram(e.target.value)}
                  placeholder="studio_carlasanny"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2.5 text-sm text-stone-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                {settingsSavedMessage ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>Salvo com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Appointment */}
      {isNewAppointmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto apple-shadow-lg border border-rose-100">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Novo Agendamento</h3>
                <p className="text-xs text-stone-500">Agendar cliente manualmente</p>
              </div>
              <button
                onClick={() => setIsNewAppointmentOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rose-600" />
                  <span>Nome da Cliente:</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: Dona Helena"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>WhatsApp ou Telefone:</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(maskPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase mb-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-rose-600" />
                    <span>Data:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Horário:</span>
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    {[...studioInfo.timeSlotsMorning, ...studioInfo.timeSlotsAfternoon].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Serviço Principal:
                </label>
                <select
                  value={newSelectedServices[0]?.id}
                  onChange={(e) => {
                    const s = INITIAL_SERVICES.find(srv => srv.id === e.target.value);
                    if (s) setNewSelectedServices([s]);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                >
                  {INITIAL_SERVICES.map(srv => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} - {formatCurrency(srv.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Observações (opcional):
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Quer esmalte renda, cliente pontual..."
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-500 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Salvar Agendamento na Agenda</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
