import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useEffect, useRef } from 'react';
import type { BusinessHours, CalendarEvent } from '../types/types';
import {
  formatTime,
  getEventGridPosition,
  getTimeSlots,
  isSameDay,
  isWithinBusinessHours,
  overlapLevels,
} from '../utils/calendarUtils';

interface TimeGridViewProps {
  events: CalendarEvent[];
  dates: Dayjs[];
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Dayjs) => void;
  businessHours: BusinessHours[] | undefined;
  minTime: string;
  maxTime: string;
  slotDuration: number;
  currentTimeLine: boolean;
}

const SLOT_HEIGHT = 64;

export const TimeGridView: React.FC<TimeGridViewProps> = ({
  events,
  dates,
  minTime,
  maxTime,
  slotDuration,
  onEventClick,
  onSlotClick,
  businessHours,
  currentTimeLine,
}) => {
  const includesTodayInDates = dates.find((d) => d.isSame(dayjs(), 'day'));
  const timeSlots = getTimeSlots(dates[0], minTime, maxTime, slotDuration);
  const timestampForLine = dayjs()
    .set('date', timeSlots[0].get('date'))
    .set('month', timeSlots[0].get('month'))
    .set('day', timeSlots[0].get('day'));
  const minutesFromStart = timestampForLine.diff(timeSlots[0], 'minute');
  const currentTimeTop = (minutesFromStart / slotDuration) * SLOT_HEIGHT;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lineRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        const containerTop = scrollContainerRef.current;
        const lineTop = lineRef.current?.getBoundingClientRect().top;
        const target =
          lineTop && containerTop && Math.max(0, lineTop - containerTop?.clientHeight / 2);

        if (target) {
          containerTop?.scrollTo({
            top: target,
            behavior: 'smooth',
          });
        }
      }, 200);
    }
  }, []);

  return (
    <div className="h-full w-full overflow-hidden">
      <div
        id="timegrid-scroll-container"
        ref={scrollContainerRef}
        className="relative flex h-full overflow-auto border-t border-gray-200"
      >
        {/* Time Column */}
        <div className="w-16 shrink-0">
          {timeSlots.map((slot, tIdx) => (
            <div
              key={tIdx}
              className="flex h-16 items-start justify-end border-r border-b border-gray-200 bg-gray-100 pt-1 pr-2"
            >
              <span className="text-xs font-medium text-gray-500">{formatTime(slot)}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="relative flex flex-1">
          {/* Current Time Indicator */}
          
          {includesTodayInDates && currentTimeLine && (
            <div
              id="current-time-line"
              ref={lineRef}
              className="pointer-events-none absolute right-0 left-0 z-50 h-px bg-red-500"
              style={{ top: `${currentTimeTop}px` }}
            />
          )}

          {dates.map((date, dateIdx) => {
            const dayEvents = events.filter((e) => isSameDay(e.start, date));
            const depths = overlapLevels(dayEvents);

            return (
              <div key={date.toISOString() + dateIdx} className="relative flex-1 border-gray-200">
                {/* Time Slots */}
                {timeSlots.map((slot, slotIdx) => {
                  const slotDate = dayjs(date.format())
                    .hour(slot.get('hours'))
                    .minute(slot.get('minutes'));
                  const outsideBusinessHours = !isWithinBusinessHours(slotDate, businessHours);

                  return (
                    <div
                      key={slotIdx}
                      className={`group h-16 border-r border-b border-gray-200 transition-colors last:border-r-0 hover:bg-gray-100 ${
                        outsideBusinessHours ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => onSlotClick?.(slotDate)}
                    />
                  );
                })}

                {/* Events */}
                {dayEvents.map((event, dayIdx) => {
                  const style = getEventGridPosition(event, date, timeSlots, SLOT_HEIGHT);
                  if (!style) return null;

                  const depth = depths[dayIdx];
                  const shrinkPerLevel = 15;
                  const totalShrink = depth * shrinkPerLevel;

                  return (
                    <div
                      key={event.id}
                      className={`z-100 cursor-pointer rounded-md border-2 border-gray-400 px-2 py-1 opacity-95 shadow-lg transition-all hover:z-1000 hover:border-white hover:opacity-100 hover:shadow-lg focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none`}
                      style={{
                        position: 'absolute',
                        top: `${style.top}px`,
                        height: `${style.height}px`,
                        backgroundColor: event.backgroundColor || '#3b82f6',
                        color: event.textColor || 'white',
                        left: '1px',
                        right: `${1 + totalShrink}px`,
                      }}
                      onClick={() => onEventClick?.(event)}
                      tabIndex={0}
                    >
                      <div className="text-xs font-semibold">{formatTime(event.start)}</div>
                      <div className="overflow-hidden text-xs font-medium text-ellipsis">
                        {event.title}
                      </div>
                      {event.subtitle && style.height > 46 && (
                        <div className="overflow-hidden text-[11px] text-ellipsis opacity-90">
                          {event.subtitle}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};