import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';
import { MonthView } from './Components/MonthView';
import { ResourceTimelineView } from './Components/ResourceTimelineView';
import { TimeGridView } from './Components/TimeGridView';
import { Toolbar } from './Components/Toolbar';
import './index.css';
import type { CalendarEvent, CalendarView, SchedulerProps, SchedulerTranslations } from './types/types';
import { getMonthDates, getWeekDates, isSameDay } from './utils/calendarUtils';

dayjs.extend(isoWeek);
dayjs.extend(utc);

const DEFAULT_TRANSLATIONS: SchedulerTranslations = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
  today: 'Today',
  previous: 'Previous',
  next: 'Next',
  resourceTitle: 'Resources',
  moreButtonLabel: 'more',
  allEventsTitle: 'All Events',
  newEvent: 'New Event',
};

export const Scheduler: React.FC<SchedulerProps> = ({
  calendarEvents = [],
  calendarResources = [],
  toolbar = undefined,
  date,
  slotDuration = 15,
  minTime = '00:00',
  maxTime = '24:00',
  editable = true,
  selectable = true,
  resourceEnabled = false,
  settingsEnabled = false,
  businessHours,
  currentTimeLine = false,
  className = '',
  height = '100%',
  translations: userTranslations,
  onEventClick,
  onEventChange,
  onSlotSelect,
  onDateChange,
  onViewChange,
  onNewEvent,
}) => {
  const translations: SchedulerTranslations = {
    ...DEFAULT_TRANSLATIONS,
    ...userTranslations,
  };

  const [currentDate, setCurrentDate] = useState(date);
  const [currentView, setCurrentView] = useState<CalendarView>(
    resourceEnabled ? 'resourceDay' : 'week',
  );

  const handlePrevious = () => {
    let d = dayjs(currentDate).utc();

    if (currentView === 'day' || currentView === 'resourceDay') {
      d = d.subtract(1, 'day');
      onDateChange?.({
        start: d.startOf('d'),
        end: d.endOf('d'),
      });
    } else if (currentView === 'week' || currentView === 'resourceWeek') {
      const newStart = d.subtract(1, 'week').startOf('isoWeek');
      onDateChange?.({
        start: newStart.startOf('isoWeek'),
        end: newStart.endOf('isoWeek'),
      });
      d = newStart;
    } else {
      const newStart = d.subtract(1, 'month');
      onDateChange?.({
        start: newStart.startOf('month'),
        end: newStart.endOf('month'),
      });
      d = newStart;
    }

    setCurrentDate(dayjs(d));
  };

  const handleNext = () => {
    let d = dayjs(currentDate).utc();

    if (currentView === 'day' || currentView === 'resourceDay') {
      d = d.add(1, 'day');
      onDateChange?.({
        start: d.startOf('d'),
        end: d.endOf('d'),
      });
    } else if (currentView === 'week' || currentView === 'resourceWeek') {
      const newEnd = d.add(1, 'week').startOf('isoWeek');
      onDateChange?.({
        start: newEnd.startOf('isoWeek'),
        end: newEnd.endOf('isoWeek'),
      });
      d = newEnd;
    } else {
      const newEnd = d.add(1, 'month');
      onDateChange?.({
        start: newEnd.startOf('month'),
        end: newEnd.endOf('month'),
      });
      d = newEnd.startOf('month');
    }

    setCurrentDate(dayjs(d));
  };

  const handleToday = () => {
    const today = dayjs().utc();
    setCurrentDate(dayjs());

    if (currentView === 'week' || currentView === 'resourceWeek') {
      return onDateChange?.({
        start: today.startOf('isoWeek'),
        end: today.endOf('isoWeek'),
      });
    }

    if (currentView === 'month') {
      return onDateChange?.({
        start: today.startOf('month'),
        end: today.endOf('month'),
      });
    }

    onDateChange?.({
      start: today.startOf('d'),
      end: today.endOf('d'),
    });
  };

  const handleTimeChangeOnViewChange = (newView: CalendarView) => {
    const d = dayjs(currentDate).utc();

    if (newView === 'week' || newView === 'resourceWeek') {
      onDateChange?.({
        start: d.startOf('isoWeek'),
        end: d.endOf('isoWeek'),
      });
    } else if (newView === 'month') {
      onDateChange?.({
        start: d.startOf('month'),
        end: d.endOf('month'),
      });
    } else {
      onDateChange?.({
        start: d.startOf('d'),
        end: d.endOf('d'),
      });
    }
  };

  const handleViewChange = (newView: CalendarView) => {
    setCurrentView(newView);
    onViewChange?.(newView);
    handleTimeChangeOnViewChange(newView);
  };

  const handleSlotClick = (date: Dayjs, resourceId?: string) => {
    if (!selectable) return;
    const end = date.add(slotDuration, 'minutes');
    onSlotSelect?.(date, end, resourceId);
  };

  const handleEventDrop = async (
    event: CalendarEvent,
    newStart: Dayjs,
    newEnd: Dayjs,
    newResourceId?: string,
  ) => {
    if (!editable || !onEventChange) return;

    const updatedEvent: CalendarEvent = {
      ...event,
      start: newStart,
      end: newEnd,
      resourceId: newResourceId || event.resourceId,
    };

    const revert = () => {};

    await onEventChange(updatedEvent, revert);
  };

  const renderView = () => {
    if (currentView === 'resourceDay' && resourceEnabled) {
      return (
        <ResourceTimelineView
          events={calendarEvents}
          resources={calendarResources}
          date={currentDate}
          onEventClick={onEventClick}
          onSlotClick={handleSlotClick}
          editable={editable}
          onEventDrop={handleEventDrop}
          maxTime={maxTime}
          minTime={minTime}
          slotDuration={slotDuration}
          resourcesTitle={translations.resourceTitle}
          currentTimeLine={currentTimeLine}
        />
      );
    } else if (currentView === 'resourceWeek' && resourceEnabled) {
      const weekDates = getWeekDates(currentDate);
      return (
        <div className="space-y-6">
          {weekDates.map((date) => (
            <div
              key={date.toISOString()}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-200 bg-gray-100 px-4 py-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {date.format('dddd, MMMM D, YYYY')}
                </h3>
              </div>
              <ResourceTimelineView
                events={calendarEvents}
                resources={calendarResources}
                date={date}
                maxTime={maxTime}
                minTime={minTime}
                slotDuration={slotDuration}
                onEventClick={onEventClick}
                onSlotClick={handleSlotClick}
                editable={editable}
                onEventDrop={handleEventDrop}
                resourcesTitle={translations.resourceTitle}
                currentTimeLine={currentTimeLine}
              />
            </div>
          ))}
        </div>
      );
    } else if (currentView === 'week') {
      const weekDates = getWeekDates(currentDate);
      return (
        <>
          <div className="flex border-gray-200 bg-gray-100">
            <div className="w-16 shrink-0 border-r border-gray-200" />
            {weekDates.map((date) => (
              <div
                key={date.toISOString()}
                className="flex flex-1 flex-col items-center justify-center border-r border-gray-200 py-2 last:border-r-1"
              >
                <span className="text-xs font-medium text-gray-600">{date.format('ddd')}</span>
                <span
                  className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    isSameDay(dayjs(), date) ? 'bg-blue-500 text-white' : 'text-gray-900'
                  }`}
                >
                  {date.format('D')}
                </span>
              </div>
            ))}
          </div>
          <TimeGridView
            events={calendarEvents}
            dates={weekDates}
            maxTime={maxTime}
            minTime={minTime}
            slotDuration={slotDuration}
            onEventClick={onEventClick}
            onSlotClick={handleSlotClick}
            businessHours={businessHours}
            currentTimeLine={currentTimeLine}
          />
        </>
      );
    } else if (currentView === 'day') {
      return (
        <>
          <div className="border-b border-gray-200 bg-gray-100 px-6 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {currentDate.format('dddd, MMMM D, YYYY')}
            </h3>
          </div>
          <TimeGridView
            events={calendarEvents}
            dates={[currentDate]}
            maxTime={maxTime}
            minTime={minTime}
            slotDuration={slotDuration}
            onEventClick={onEventClick}
            onSlotClick={handleSlotClick}
            businessHours={businessHours}
            currentTimeLine={currentTimeLine}
          />
        </>
      );
    } else {
      const monthDates = getMonthDates(currentDate);

      return (
        <MonthView
          events={calendarEvents}
          dates={monthDates}
          onEventClick={onEventClick}
          onDateClick={handleSlotClick}
          moreButtonLabel={translations.moreButtonLabel}
          allEventsTitle={translations.allEventsTitle}
        />
      );
    }
  };

  return (
    <div
      className={`scheduler flex flex-col overflow-hidden bg-white ${className}`}
      style={{ height }}
    >
      {toolbar ?? (
        <Toolbar
          currentDate={currentDate}
          currentView={currentView}
          resourceEnabled={resourceEnabled}
          settingsEnabled={settingsEnabled}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onViewChange={handleViewChange}
          onNewEvent={onNewEvent}
          translations={translations}
        />
      )}

      <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white no-scrollbar">
        {renderView()}
      </div>
    </div>
  );
};