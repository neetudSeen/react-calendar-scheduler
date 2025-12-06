import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import type { CalendarEvent, CalendarResource } from '../types/types';
import {
  formatTime,
  getOverlapDepth,
  getResourceEventPosition,
  getTimeSlots,
  isSameDay,
} from '../utils/calendarUtils';

interface ResourceTimelineViewProps {
  events: CalendarEvent[];
  resources: CalendarResource[];
  date: Dayjs;
  resourcesTitle?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Dayjs, resourceId: string) => void;
  editable?: boolean;
  onEventDrop?: (
    event: CalendarEvent,
    newStart: Dayjs,
    newEnd: Dayjs,
    newResourceId?: string,
  ) => void;
  minTime: string;
  maxTime: string;
  slotDuration: number;
  currentTimeLine: boolean;
}

const SLOT_WIDTH = 60;
const ROW_HEIGHT = 80;
const HEADER_HEIGHT = 48;

export const ResourceTimelineView: React.FC<ResourceTimelineViewProps> = ({
  events,
  resources,
  date,
  resourcesTitle = 'Resources',
  onEventClick,
  onSlotClick,
  editable,
  onEventDrop,
  minTime,
  maxTime,
  slotDuration,
  currentTimeLine,
}) => {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragPosition, setDragPosition] = useState<{
    left: number;
    resourceId: string;
    resourceIndex: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const timeSlots = getTimeSlots(date, minTime, maxTime, slotDuration);

  useEffect(() => {
    if (!draggedEvent || !editable) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedEvent) return;

      const moveThreshold = 5;
      if (dragStartRef.current && !isDraggingRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > moveThreshold) {
          isDraggingRef.current = true;
        } else {
          return;
        }
      }
      if (!isDraggingRef.current) return;

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;

      const relativeX = e.clientX - containerRect.left + scrollLeft - dragOffset;
      const relativeY = e.clientY - containerRect.top;

      const adjustedY = relativeY - HEADER_HEIGHT;
      const resourceIndex = Math.floor(adjustedY / ROW_HEIGHT);
      const clampedResourceIndex = Math.max(0, Math.min(resources.length - 1, resourceIndex));
      const resourceId = resources[clampedResourceIndex]?.id;

      if (!resourceId) return;

      const eventWidth = getResourceEventPosition(draggedEvent, timeSlots).width;
      const maxLeft = timeSlots.length * SLOT_WIDTH - eventWidth;
      const snappedLeft = Math.round(relativeX / SLOT_WIDTH) * SLOT_WIDTH;
      const clampedLeft = Math.max(0, Math.min(maxLeft, snappedLeft));

      setDragPosition({
        left: clampedLeft,
        resourceId,
        resourceIndex: clampedResourceIndex,
      });
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current && draggedEvent) {
        onEventClick?.(draggedEvent);
      }

      if (draggedEvent && dragPosition && onEventDrop) {
        const slotIndex = Math.round(dragPosition.left / SLOT_WIDTH);
        const slot = timeSlots[Math.min(slotIndex, timeSlots.length - 1)];

        if (slot) {
          const durationMs = dayjs(draggedEvent.end).diff(dayjs(draggedEvent.start));
          const newStart = date.hour(slot.hour()).minute(slot.minute()).second(0).millisecond(0);
          const newEnd = newStart.add(durationMs, 'millisecond');

          onEventDrop(draggedEvent, newStart, newEnd, dragPosition.resourceId);
        }
      }

      isDraggingRef.current = false;
      setDraggedEvent(null);
      setDragPosition(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    draggedEvent,
    dragOffset,
    dragPosition,
    resources,
    timeSlots,
    date,
    editable,
    onEventDrop,
    onEventClick,
  ]);

  const handleEventMouseDown = (e: React.MouseEvent, event: CalendarEvent) => {
    if (!editable) return;

    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const container = containerRef.current;
    if (!container) return;

    const offset = e.clientX - rect.left;

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setDragOffset(offset);
    setDraggedEvent(event);
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const container = containerRef.current;
    const line = document.getElementById('current-time-line');
    if (!container || !line || timeSlots.length === 0) return;

    const updateLinePosition = () => {
      const now = dayjs();
      const start = timeSlots[0];
      const end = timeSlots[timeSlots.length - 1];
      const totalMs = end.diff(start);
      const elapsedMs = now.diff(start);
      const ratio = Math.max(0, Math.min(1, elapsedMs / totalMs));

      const totalWidth = timeSlots.length * SLOT_WIDTH;
      const leftPx = ratio * totalWidth;
      line.style.left = `${leftPx}px`;
    };

    updateLinePosition();
    const interval = setInterval(updateLinePosition, 60000 * 5);

    setTimeout(() => {
      const lineLeft = parseFloat(line.style.left || '0');
      const target = Math.max(0, lineLeft - container.clientWidth / 2);

      container.scrollTo({
        left: target,
        behavior: 'smooth',
      });
    }, 200);

    return () => clearInterval(interval);
  }, [timeSlots]);

  return (
    <div className="timeline-view flex h-full flex-col overflow-hidden">
      <div className="grid h-full grid-cols-[200px_1fr] overflow-auto border-gray-200">
        {/* Resource Column */}
        <div className="border-r border-gray-200 bg-gray-100">
          <div className="flex h-12 items-center border-b border-gray-200 px-4">
            <span className="text-sm font-semibold text-gray-700">{resourcesTitle}</span>
          </div>
          {resources.map((resource) => (
            <div key={resource.id} className="flex h-20 items-center border-b border-gray-200 px-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{resource.title}</span>
                {resource.subTitle && (
                  <span className="text-xs text-gray-500">{resource.subTitle}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Grid */}
        <div ref={containerRef} className="relative overflow-x-auto" id="timeline-scroll-container">
          {/* Time Header */}
          <div className="sticky top-0 z-10 flex border-gray-200 bg-gray-100">
            {timeSlots.map((slot, i) => (
              <div
                key={i + slot.toISOString()}
                className="flex h-12 min-w-[60px] items-center justify-center border-r border-b border-gray-200 bg-gray-100 px-2 last:border-r-0"
              >
                <span className="text-xs font-medium text-gray-600">{formatTime(slot)}</span>
              </div>
            ))}
          </div>

          {/* Current Time Line */}
          {currentTimeLine && <div
            id="current-time-line"
            className="pointer-events-none absolute top-12 bottom-0 z-20 w-px bg-red-400"
          />}
          

          {/* Resource Rows */}
          {resources.map((resource, resourceIndex) => {
            const resourceEvents = events.filter(
              (e) => e.resourceId === resource.id && isSameDay(dayjs(e.start), date),
            );

            return (
              <div key={resource.id} className="relative flex h-20">
                {/* Time Slots */}
                {timeSlots.map((slot, colIndex) => (
                  <div
                    key={colIndex + slot.toISOString()}
                    className={`group min-w-[60px] border-r border-b border-gray-200 transition-colors hover:bg-gray-50 ${
                      colIndex === timeSlots.length - 1 ? 'border-r-0' : ''
                    }`}
                    onClick={() => onSlotClick?.(slot, resource.id)}
                  />
                ))}

                {/* Events */}
                {resourceEvents.map((event) => {
                  const { left, width } = getResourceEventPosition(event, timeSlots, SLOT_WIDTH);
                  const isDragging = draggedEvent?.id === event.id;

                  const shouldShowOnThisResource =
                    isDragging && dragPosition
                      ? dragPosition.resourceIndex === resourceIndex
                      : !isDragging;

                  if (!shouldShowOnThisResource) {
                    return null;
                  }

                  const eventLeft = isDragging && dragPosition ? dragPosition.left : left;
                  const overlapDepth = getOverlapDepth(event, resourceEvents);
                  const verticalOffset = overlapDepth > 0 ? overlapDepth * 22 + 4 : 4;

                  return (
                    <div
                      key={event.id}
                      id={`event-${event.id}`}
                      className="absolute rounded-md border-2 px-2 py-1 text-xs font-medium shadow-sm transition-shadow hover:shadow-md"
                      style={{
                        left: `${eventLeft}px`,
                        width: `${width}px`,
                        top: `${verticalOffset}px`,
                        height: '22px',
                        backgroundColor: event.backgroundColor || '#3b82f6',
                        borderColor: event.borderColor || event.backgroundColor || '#3b82f6',
                        color: event.textColor || 'white',
                        zIndex: isDragging ? 50 : 10,
                        opacity: isDragging ? 0.8 : 1,
                        cursor: editable ? 'move' : 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => {
                        if (!isDraggingRef.current) {
                          onEventClick?.(event);
                        }
                      }}
                      onMouseDown={(e) => handleEventMouseDown(e, event)}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {event.title}
                      </div>
                      {event.subtitle && (
                        <div className="overflow-hidden text-[10px] text-ellipsis whitespace-nowrap opacity-90">
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