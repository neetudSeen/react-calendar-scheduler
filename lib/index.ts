import './index.css';

export { Scheduler } from './Scheduler';

// Types
export type {
    BusinessHours, CalendarEvent,
    CalendarResource,
    CalendarView, DateChangeHandler, EventChangeHandler, EventClickHandler, EventMetadata,
    SchedulerProps,
    SchedulerTranslations, SlotSelectHandler, ViewChangeHandler
} from './types/types';

// Utility functions (optional, if you want to expose them)
export {
    formatDate, formatTime, getMonthDates, getTimeSlots, getWeekDates, isSameDay,
    parseTime
} from './utils/calendarUtils';

// Custom hooks (if any)
export { useIsCompact } from './utils/useIsCompact';
