export const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DAYS_FULL_PT = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function getUpcomingDays(count = 14) {
  const days = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    // Salão fechado aos domingos por padrão
    const isSunday = d.getDay() === 0;

    const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayOfWeek = DAYS_PT[d.getDay()];
    const dayOfWeekFull = DAYS_FULL_PT[d.getDay()];
    const dayOfMonth = d.getDate();
    const monthName = MONTHS_PT[d.getMonth()];

    days.push({
      date: d,
      dateKey,
      dayOfWeek,
      dayOfWeekFull,
      dayOfMonth,
      monthName,
      isToday: i === 0,
      isTomorrow: i === 1,
      isSunday,
      isAvailable: !isSunday
    });
  }

  return days;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(value);
}

export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
  if (hours > 0) return `${hours}h`;
  return `${mins} min`;
}

export function maskPhone(value) {
  const clean = value.replace(/\D/g, '');
  if (!clean) return '';
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

export function formatFullDatePortuguese(dateKey) {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = DAYS_FULL_PT[d.getDay()];
  const monthName = MONTHS_PT[month - 1];
  return `${dayName}, ${day} de ${monthName}`;
}

export function buildWhatsAppLink({ studioPhone, clientName, clientPhone, services, dateKey, time, notes }) {
  const cleanStudioPhone = studioPhone.replace(/\D/g, '');
  const servicesList = services.map(s => `• ${s.name} (${formatCurrency(s.price)} - ${formatDuration(s.duration)})`).join('\n');
  const totalPrice = services.reduce((acc, s) => acc + s.price, 0);
  const totalDurationMin = services.reduce((acc, s) => acc + s.duration, 0);
  const formattedDate = formatFullDatePortuguese(dateKey);

  const message = `✨ *NOVO AGENDAMENTO NO STUDIO CARLA SANNY* ✨\n\n` +
    `👤 *Cliente:* ${clientName}\n` +
    `📱 *WhatsApp:* ${clientPhone}\n\n` +
    `📅 *Data:* ${formattedDate}\n` +
    `⏰ *Horário:* ${time}\n\n` +
    `💅 *Serviços Selecionados (${services.length}):*\n${servicesList}\n\n` +
    `⏱️ *Tempo Total Estimado:* ${formatDuration(totalDurationMin)}\n` +
    `💰 *Valor Total:* ${formatCurrency(totalPrice)}\n` +
    (notes ? `📝 *Observação:* ${notes}\n\n` : `\n`) +
    `Olá Carla! Gostaria de confirmar estes agendamentos com você. Obrigada! 💕`;

  return `https://wa.me/${cleanStudioPhone}?text=${encodeURIComponent(message)}`;
}
