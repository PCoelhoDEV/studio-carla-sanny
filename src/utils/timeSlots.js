/**
 * Utilities for salon scheduling, interval math, and conflict detection.
 */

// Convert "08:30" -> 510 minutes
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
}

// Convert 510 -> "08:30"
export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// All standard salon slots in 30-min increments
export const ALL_SALON_SLOTS = [
  // Manhã
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  // Tarde (até 18:30)
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export const MORNING_END_MINUTES = timeToMinutes('12:00');
export const AFTERNOON_END_MINUTES = timeToMinutes('19:00');

/**
 * Checks if two time intervals overlap.
 * Interval 1: [start1, start1 + dur1)
 * Interval 2: [start2, start2 + dur2)
 */
export function doIntervalsOverlap(start1, dur1, start2, dur2) {
  const end1 = start1 + dur1;
  const end2 = start2 + dur2;
  return Math.max(start1, start2) < Math.min(end1, end2);
}

/**
 * Given a date, total duration needed, and all existing appointments,
 * returns slot statuses for every slot in ALL_SALON_SLOTS.
 */
export function getSlotAvailability({
  dateKey,
  durationNeeded,
  existingAppointments = [],
  slots = ALL_SALON_SLOTS
}) {
  // Filter active appointments for this date (ignoring cancelled ones)
  const activeBookings = existingAppointments.filter(apt => 
    apt.date === dateKey && apt.status !== 'cancelado'
  ).map(apt => {
    const startMins = timeToMinutes(apt.time);
    const duration = (apt.services || []).reduce((acc, s) => acc + (s.duration || 60), 0) || 60;
    return {
      id: apt.id,
      clientName: apt.clientName,
      time: apt.time,
      startMins,
      duration,
      endMins: startMins + duration
    };
  });

  return slots.map(timeStr => {
    const slotStart = timeToMinutes(timeStr);
    const slotEnd = slotStart + durationNeeded;

    // Check if slot exceeds work shifts:
    // If started in morning, cannot extend past 12:00 lunch break
    const isMorning = slotStart < timeToMinutes('12:00');
    if (isMorning && slotEnd > MORNING_END_MINUTES) {
      return {
        time: timeStr,
        isAvailable: false,
        reason: 'Passa do horário de almoço'
      };
    }

    // If started in afternoon, cannot extend past 19:00 closing
    if (!isMorning && slotEnd > AFTERNOON_END_MINUTES) {
      return {
        time: timeStr,
        isAvailable: false,
        reason: 'Passa do fechamento (19:00)'
      };
    }

    // Check collision with any existing booking
    const collidingBooking = activeBookings.find(booking => 
      doIntervalsOverlap(slotStart, durationNeeded, booking.startMins, booking.duration)
    );

    if (collidingBooking) {
      return {
        time: timeStr,
        isAvailable: false,
        reason: `Ocupado (${collidingBooking.time} às ${minutesToTime(collidingBooking.endMins)})`,
        bookedBy: collidingBooking.clientName
      };
    }

    return {
      time: timeStr,
      isAvailable: true,
      reason: 'Disponível'
    };
  });
}
