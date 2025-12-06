import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import { useState } from 'react';
import type { CalendarEvent } from '../types/types';
import { formatTime, isSameDay } from '../utils/calendarUtils';
import { ShowAllEventsModal } from './ShowAllEventsModal';
dayjs.extend(localeData);

type MonthViewProps = {
  events: CalendarEvent[];
  dates: Dayjs[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Dayjs) => void;
  moreButtonLabel?: string;
  allEventsTitle?: string;
};

export const MonthView = ({
  events,
  dates,
  onEventClick,
  onDateClick,
  moreButtonLabel,
  allEventsTitle,
}: MonthViewProps) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [triggerRect, setTriggerRect] = useState<HTMLElement | null>(null);

  const handleMoreHover = (e: React.MouseEvent<HTMLDivElement>, dateIndex: number) => {
    setTriggerRect(e.currentTarget);
    setHoveredCell(dateIndex);
  };

  const handleMoreLeave = () => {
    setHoveredCell(null);
  };

  // Get locale-aware weekday names starting with locale's first day - translated based on the locale set to dayjs.locale
  const dayjsWeekDays = dayjs().localeData();
  const firstDayOfWeek = dayjsWeekDays.firstDayOfWeek();
  const weekdaysShort = dayjsWeekDays.weekdaysShort();
  const weekdays = [
    ...weekdaysShort.slice(firstDayOfWeek),
    ...weekdaysShort.slice(0, firstDayOfWeek),
  ];

  return (
    <div className="h-full overflow-hidden rounded-lg bg-white shadow">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekdays.map((day) => (
          <div
            key={day}
            className="border-r border-gray-200 bg-gray-100 p-2 text-center text-sm font-semibold text-gray-700 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid h-full grid-cols-7">
        {dates.map((date, dateIndex) => {
          const dayEvents = events.filter((e) => isSameDay(e.start, date));

          const isCurrentMonth = date.month() === dates[Math.floor(dates.length / 2)].month();
          const isToday = dayjs().isSame(date, 'day');

          return (
            <div
              key={dateIndex}
              className={`relative min-h-24 cursor-pointer border-r border-b border-gray-200 p-2 transition-all duration-250 ease-in-out hover:bg-gray-50 ${
                (dateIndex + 1) % 7 === 0 ? 'border-r-0' : ''
              }`}
              onClick={() => onDateClick?.(date)}
              onMouseLeave={handleMoreLeave}
            >
              <div className="mb-2 flex justify-end text-right">
                <span
                  className={`text-sm font-medium ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white' : ''}`}
                >
                  {date.date()}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    className="cursor-pointer truncate rounded p-1 text-xs text-white hover:opacity-80"
                    style={{ backgroundColor: event.backgroundColor || '#3b82f6' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <span className="font-medium text-white">
                      {formatTime(event.start)} {event.title}
                    </span>
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div
                    className="relative cursor-pointer pl-1 text-xs font-medium text-blue-500 hover:underline"
                    onMouseEnter={(e) => handleMoreHover(e, dateIndex)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    +{dayEvents.length - 3} {moreButtonLabel}
                    {hoveredCell === dateIndex && (
                      <ShowAllEventsModal
                        triggerElement={triggerRect}
                        allEventsTitle={allEventsTitle}
                        events={dayEvents}
                        onEventClick={(event) => {
                          handleMoreLeave();
                          onEventClick?.(event);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};