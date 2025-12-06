/**
 * Type definitions for Custom Scheduler
 */

import type { Dayjs } from 'dayjs';
import type { ReactElement } from 'react';

/**
 * Business hours configuration
 */
export interface BusinessHours {
  /** Days of the week (0=Sunday, 1=Monday, ..., 6=Saturday) */
  daysOfWeek: number[];
  /** Start time in HH:mm format */
  startTime: string;
  /** End time in HH:mm format */
  endTime: string;
}

/**
 * Generic metadata that can be attached to events
 */
export interface EventMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Internal calendar event for rendering
 */
export interface CalendarEvent {
  /** Unique event identifier */
  id: string;
  /** Resource ID */
  resourceId: string;
  /** Event title/name */
  title: string;
  /** Event start date and time */
  start: Dayjs;
  /** Event end date and time */
  end: Dayjs;
  /** Background color */
  backgroundColor?: string;
  /** Border color */
  borderColor?: string;
  /** Text color */
  textColor?: string;
  /** Optional subtitle for the event */
  subtitle?: string;
  /** Additional metadata */
  metadata?: EventMetadata;
}

/**
 * Calendar resource (e.g., room, person, equipment)
 */
export interface CalendarResource {
  /** Unique resource identifier */
  id: string;
  /** Resource display name */
  title: string;
  /** Optional subtitle */
  subTitle?: string;
  /** Business hours specific to this resource */
  businessHours?: BusinessHours[];
}

/**
 * Available calendar views
 */
export type CalendarView = 'day' | 'week' | 'month' | 'resourceDay' | 'resourceWeek';

/**
 * Event click handler
 */
export type EventClickHandler = (event: CalendarEvent) => void;

/**
 * Event change handler (drag/resize)
 */
export type EventChangeHandler = (
  event: CalendarEvent,
  revert: () => void,
) => Promise<boolean> | boolean;

/**
 * Slot select handler
 */
export type SlotSelectHandler = (start: Dayjs, end: Dayjs, resourceId?: string) => void;

/**
 * Date change handler
 */
export type DateChangeHandler = ({ start, end }: { start: Dayjs; end: Dayjs }) => void;

/**
 * View change handler
 */
export type ViewChangeHandler = (view: CalendarView) => void;

/**
 * Translation strings for the scheduler
 */
export interface SchedulerTranslations {
  // View names
  day: string;
  week: string;
  month: string;
  year: string;
  
  // Navigation
  today: string;
  previous: string;
  next: string;
  
  // Resource view
  resourceTitle: string;
  
  // Month view
  moreButtonLabel: string;
  allEventsTitle: string;
  
  // Actions
  newEvent: string;
}

/**
 * Main Scheduler component props
 */
export interface SchedulerProps {
  /** Unique key for the scheduler instance */
  key?: string;
  /** Array of calendar events */
  calendarEvents: CalendarEvent[];
  /** Array of resources */
  calendarResources?: CalendarResource[];
  /** Current view type */
  view?: CalendarView;
  /** Current date */
  date: Dayjs;
  /** Duration of each time slot in minutes */
  slotDuration?: number;
  /** Minimum time to display (HH:mm format) */
  minTime?: string;
  /** Maximum time to display (HH:mm format) */
  maxTime?: string;
  /** Allow events to be dragged and resized */
  editable?: boolean;
  /** Allow time slot selection */
  selectable?: boolean;
  /** Event click callback */
  onEventClick?: EventClickHandler;
  /** Event change (drag/resize) callback */
  onEventChange?: EventChangeHandler;
  /** Time slot selection callback */
  onSlotSelect?: SlotSelectHandler;
  /** Date change callback */
  onDateChange?: DateChangeHandler;
  /** View change callback */
  onViewChange?: ViewChangeHandler;
  /** Additional CSS classes */
  className?: string;
  /** Component height (CSS value) */
  height?: string | number;
  /** Enable resource views */
  resourceEnabled?: boolean;
  /** Show settings button */
  settingsEnabled?: boolean;
  /** Business hours configuration */
  businessHours?: BusinessHours[];
  /** Show current time indicator */
  currentTimeLine?: boolean;
  /** Custom toolbar component */
  toolbar?: ReactElement;
  /** Translation strings */
  translations?: Partial<SchedulerTranslations>;
  /** Custom new event button handler */
  onNewEvent?: () => void;
}