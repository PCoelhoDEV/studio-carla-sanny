export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Generates the full 7-column calendar matrix for a given year and month (0-indexed).
 */
export function getMonthMatrix(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const matrix = [];
  let currentWeek = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    currentWeek.push({
      date: d,
      dateKey: d.toISOString().split('T')[0],
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPast: true,
      isSunday: d.getDay() === 0
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isPast = d.getTime() < today.getTime();
    const isToday = d.getTime() === today.getTime();
    const isSunday = d.getDay() === 0;

    currentWeek.push({
      date: d,
      dateKey,
      dayNumber: day,
      isCurrentMonth: true,
      isPast,
      isToday,
      isSunday
    });

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month leading days to complete the last week
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      const d = new Date(year, month + 1, nextMonthDay);
      currentWeek.push({
        date: d,
        dateKey: d.toISOString().split('T')[0],
        dayNumber: nextMonthDay,
        isCurrentMonth: false,
        isPast: false,
        isSunday: d.getDay() === 0
      });
      nextMonthDay++;
    }
    matrix.push(currentWeek);
  }

  return matrix;
}
