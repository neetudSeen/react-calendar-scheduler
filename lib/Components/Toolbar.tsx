import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { CalendarView, SchedulerTranslations } from "../types/types";
import { useIsCompact } from "../utils/useIsCompact";

interface ToolbarProps {
  currentDate: Dayjs;
  currentView: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  settingsEnabled?: boolean;
  resourceEnabled?: boolean;
  onNewEvent?: () => void;
  translations: SchedulerTranslations;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentDate,
  currentView,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  resourceEnabled = true,
  onNewEvent,
  translations,
}) => {
  const smallScreen = useIsCompact();
  const changeView = (scheduleView: CalendarView): void => {
    onViewChange(scheduleView);
  };

  const formatDateRange = () => {
    if (currentView === "week") {
      return (
        dayjs(currentDate).startOf("week").format("DD") +
        " - " +
        dayjs(currentDate).endOf("week").format("DD MMMM")
      );
    } else if (currentView === "month") {
      return dayjs(currentDate).format("MMMM YYYY");
    } else {
      return dayjs(currentDate).format("DD MMMM");
    }
  };

  return (
    <div className="grid w-full grid-cols-3 bg-white pb-4">
      {/* Left Section - Navigation */}
      <div className="flex flex-row items-center justify-start gap-2">
        <button
          onClick={onPrevious}
          className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-500 focus:outline-none focus:border-blue-500 focus:text-blue-500"
          title={translations.previous}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={onToday}
          className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-500 focus:outline-none focus:border-blue-500 focus:text-blue-500"
          title={translations.today}
        >
          {translations.today}
        </button>

        <button
          onClick={onNext}
          className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-500 focus:outline-none focus:border-blue-500 focus:text-blue-500"
          title={translations.next}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <span className="ml-2 overflow-hidden text-base font-semibold text-gray-900 text-ellipsis whitespace-nowrap">
          {formatDateRange()}
        </span>
      </div>

      {/* Center Section - View Switcher */}
      <div className="flex flex-row items-center justify-center">
        <div className="inline-flex">
          {resourceEnabled ? (
            <button
              onClick={() => changeView("resourceDay")}
              className={`inline-flex h-8 cursor-pointer items-center justify-center px-4 text-sm border border-gray-300 rounded-l-md transition-colors focus:outline-none focus:z-10 ${
                currentView === "resourceDay"
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  : "bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500"
              }`}
              title={translations.day}
            >
              {translations.day}
            </button>
          ) : (
            <button
              onClick={() => changeView("week")}
              className={`inline-flex h-8 items-center cursor-pointer justify-center px-4 text-sm border border-gray-300 rounded-l-md transition-colors focus:outline-none focus:z-10 ${
                currentView === "week"
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  : "bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500"
              }`}
              title={translations.week}
            >
              {translations.week}
            </button>
          )}

          <button
            onClick={() => changeView("month")}
            className={`inline-flex h-8 items-center cursor-pointer justify-center px-4 text-sm border border-gray-300 border-l-0 rounded-r-md -ml-px transition-colors focus:outline-none focus:z-10 ${
              currentView === "month"
                ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 border-2"
                : "bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500"
            }`}
            title={translations.month}
          >
            {translations.month}
          </button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex flex-row items-center justify-end gap-2">
        {onNewEvent && (
          <button
            onClick={onNewEvent}
            className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-blue-500 bg-blue-500 px-4 text-sm text-white transition-colors hover:bg-blue-600 hover:border-blue-600 focus:outline-none focus:bg-blue-600"
          >
            + {smallScreen ? "" : translations.newEvent}
          </button>
        )}
      </div>
    </div>
  );
};
