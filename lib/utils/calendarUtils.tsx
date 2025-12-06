import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekday from 'dayjs/plugin/weekday';

import 'dayjs/locale/en-gb';
import 'dayjs/locale/et';
import 'dayjs/locale/fr';
import type { BusinessHours, CalendarEvent } from '../types/types';

dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);

/**
 * Get array of dates for a week view, respecting locale
 */
export const getWeekDates = (date: Dayjs): Dayjs[] => {
  const start = date.locale(date.locale()).weekday(0);
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
};

/**
 * Get array of dates for a month view (includes days from adjacent months), respecting locale
 */
export const getMonthDates = (date: Dayjs | Date): Dayjs[] => {
  const d = dayjs(date).locale(dayjs(date).locale());
  const firstDay = d.startOf('month');
  const lastDay = d.endOf('month');

  const startDate = firstDay.weekday(0);
  const endDate = lastDay.weekday(6);

  const dates: Dayjs[] = [];
  let current = startDate;

  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    dates.push(current);
    current = current.add(1, 'day');
  }

  return dates;
};

/**
 * Format time as HH:mm
 */
export const formatTime = (date: Dayjs): string => {
  return date.format('HH:mm');
};

/**
 * Format date as Month Day
 */
export const formatDate = (date: Dayjs): string => {
  return date.format('MMM D');
};

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (d1: Dayjs, d2: Dayjs): boolean => {
  return d1.isSame(d2, 'day');
};

/**
 * Parse time string (HH:mm) to hours and minutes
 */
export const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Get time slots for a given date range
 * Fixed to prevent timezone shifts when changing weeks
 */
export const getTimeSlots = (
  date: Dayjs,
  minTime: string,
  maxTime: string,
  duration: number,
): Dayjs[] => {
  const min = parseTime(minTime);
  const max = parseTime(maxTime);
  const slots: Dayjs[] = [];

  // Force local timezone by formatting and re-parsing
  // This ensures no UTC or timezone offsets interfere
  const baseDate = dayjs(date.format('YYYY-MM-DD'));

  let current = baseDate.hour(min.hours).minute(min.minutes).second(0).millisecond(0);

  const end = baseDate.hour(max.hours).minute(max.minutes).second(0).millisecond(0);

  while (current.isBefore(end) || current.isSame(end)) {
    slots.push(current);
    current = current.add(duration, 'minutes');
  }

  return slots;
};

/**
 * Get position and width for an event in timeline view
 * Fixed to handle timezone consistency
 */
export const getResourceEventPosition = (
  event: { start: Dayjs; end: Dayjs },
  timeSlots: Dayjs[],
  slotWidth: number = 60,
): { left: number; width: number } => {
  // Normalize to local time to prevent timezone issues
  const eventStartLocal = dayjs(event.start.format('YYYY-MM-DD HH:mm:ss'));
  const eventEndLocal = dayjs(event.end.format('YYYY-MM-DD HH:mm:ss'));

  const startMinutes = eventStartLocal.hour() * 60 + eventStartLocal.minute();
  const endMinutes = eventEndLocal.hour() * 60 + eventEndLocal.minute();
  const duration = endMinutes - startMinutes;

  const slotDuration = timeSlots[1] ? timeSlots[1].diff(timeSlots[0], 'minute') : 15;

  const firstSlotTime = timeSlots[0].hour() * 60 + timeSlots[0].minute();
  const left = ((startMinutes - firstSlotTime) / slotDuration) * slotWidth;
  const width = (duration / slotDuration) * slotWidth;

  return { left, width };
};

/**
 * Get top position and height for an event in grid view
 * Fixed to handle timezone consistency across week changes
 */
export const getEventGridPosition = (
  event: { start: Dayjs; end: Dayjs },
  date: Dayjs,
  timeSlots: Dayjs[],
  slotHeight: number = 64,
): { top: number; height: number } | null => {
  if (!event.start.isSame(date, 'day')) return null;
  if (timeSlots.length === 0) return null;

  // Normalize all times to local timezone to prevent shifts
  const eventStartLocal = dayjs(event.start.format('YYYY-MM-DD HH:mm:ss'));
  const eventEndLocal = dayjs(event.end.format('YYYY-MM-DD HH:mm:ss'));

  // Create day start in local time
  const dayStart = dayjs(date.format('YYYY-MM-DD'))
    .hour(timeSlots[0].hour())
    .minute(timeSlots[0].minute())
    .second(0)
    .millisecond(0);

  const startMinutes = eventStartLocal.diff(dayStart, 'minute');
  const duration = eventEndLocal.diff(eventStartLocal, 'minute');

  const slotDuration = timeSlots[1] ? timeSlots[1].diff(timeSlots[0], 'minute') : 15;

  const top = Math.max(0, (startMinutes / slotDuration) * slotHeight);
  const height = Math.max(45, (duration / slotDuration) * slotHeight);

  return { top, height };
};

export const isWithinBusinessHours = (slot: Dayjs, businessHours?: BusinessHours[]) => {
  if (!businessHours) return false;

  const day = slot.day(); // 0=Sunday, 1=Monday... depends on dayjs locale
  const time = slot.format('HH:mm');

  return businessHours.some((bh) => {
    if (!bh.daysOfWeek.includes(day)) return false;
    return time >= bh.startTime && time < bh.endTime;
  });
};

export const sortedEvents = (events: CalendarEvent[]) =>
  events.slice().sort((a, b) => a.start.valueOf() - b.start.valueOf());

export const overlapLevels = (events: CalendarEvent[]) => {
  const sorted = sortedEvents(events);

  return sorted.map((event, idx) => {
    let depth = 0;
    for (let i = 0; i < idx; i++) {
      const prev = sorted[i];
      const overlaps = event.start.isBefore(prev.end) && event.end.isAfter(prev.start);
      if (overlaps) depth++;
    }
    return depth;
  });
};

export const getOverlapDepth = (event: CalendarEvent, events: CalendarEvent[]) => {
  const sorted = [...events].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

  let slot = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].id === event.id) {
      slot = i % 3;
      break;
    }
  }

  return slot;
};