export const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function formatDateLong(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '';
  }
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '';
  }
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatTime(time: string | null | undefined): string {
  if (!time) {
    return '';
  }
  const [hoursRaw, minutes = '00'] = time.split(':');
  const hours = Number(hoursRaw);
  const suffix = hours >= 12 ? 'p. m.' : 'a. m.';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${`${hours}`.padStart(2, '0')}:${`${mins}`.padStart(2, '0')}:00`;
}

export function eachHour(startTime: string, endTime: string): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  for (let cursor = start; cursor + 60 <= end; cursor += 60) {
    slots.push({ start: minutesToTime(cursor), end: minutesToTime(cursor + 60) });
  }
  return slots;
}
