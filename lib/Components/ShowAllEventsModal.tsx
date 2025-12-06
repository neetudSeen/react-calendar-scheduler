import { useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '../types/types';
import { formatTime } from '../utils/calendarUtils';

type ShowAllEventsModalProps = {
  events: CalendarEvent[];
  allEventsTitle?: string;
  onEventClick?: (event: CalendarEvent) => void;
  triggerElement?: HTMLElement | null;
};

export const ShowAllEventsModal = ({
  events,
  allEventsTitle,
  onEventClick,
  triggerElement,
}: ShowAllEventsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!triggerElement || !modalRef.current) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const modal = modalRef.current;
    const modalRect = modal.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spacing = 4;

    const shouldOpenAbove = triggerRect.bottom + modalRect.height > viewportHeight;
    const top = shouldOpenAbove
      ? triggerRect.top - modalRect.height - spacing
      : triggerRect.bottom + spacing;

    const shouldOpenLeft = triggerRect.left + modalRect.width > viewportWidth;
    const left = shouldOpenLeft ? triggerRect.right - modalRect.width : triggerRect.left;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition({ top, left });
  }, [triggerElement]);

  return (
    <div
      ref={modalRef}
      className="z-50 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: '300px',
        overflowY: 'auto',
        position: 'fixed',
      }}
    >
      {allEventsTitle && (
        <div className="mb-2 text-xs font-semibold text-gray-700">
          {allEventsTitle} ({events.length})
        </div>
      )}

      <div className="space-y-1.5">
        {events.map((event) => (
          <div
            key={`${event.id}-show-all-modal`}
            className="cursor-pointer rounded p-2 text-xs transition-all duration-250 ease-in-out hover:bg-gray-50 hover:shadow-lg"
            style={{
              backgroundColor: event.backgroundColor ? `${event.backgroundColor}15` : '#f3f4f6',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick?.(event);
            }}
          >
            <div className="font-medium text-gray-900">{event.title}</div>
            <div className="mt-0.5 text-gray-600">{formatTime(event.start)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};