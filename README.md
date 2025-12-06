# React Calendar Scheduler

## Setup
- `npm i react-calendar-timeline-scheduler`

For styles use
- `import 'react-calendar-timeline-scheduler/dist/index.css';` 

## Day (ResourceTimelineView)
<img width="1142" height="437" alt="Screenshot 2025-12-06 at 21 12 46" src="https://github.com/user-attachments/assets/aff4325c-4b63-470e-bc39-ae95c746cca9" />
<img width="1145" height="531" alt="Screenshot 2025-12-06 at 21 13 06" src="https://github.com/user-attachments/assets/d4f82545-15cb-4783-b132-13269308fff7" />

## Week timeline (TimeGridView)
<img width="1139" height="872" alt="Screenshot 2025-12-06 at 21 13 45" src="https://github.com/user-attachments/assets/16cb91ae-85a3-41df-9af4-2ae0666895e3" />

## Month (MonthView)
<img width="1141" height="876" alt="Screenshot 2025-12-06 at 21 13 20" src="https://github.com/user-attachments/assets/774164cc-d404-41e3-94b3-f6744312a3cb" />

 ### View all 
<img width="1145" height="570" alt="Screenshot 2025-12-06 at 21 13 57" src="https://github.com/user-attachments/assets/32505dbd-fece-402b-9ba5-5ffcf6f5fbe0" />

## Toolbar
- Customise your own by passing toolbar attribute
```
<Scheduler toolbar={ReactElement} />
```

## Attributes
```
<Scheduler
          date={currentDate}
          calendarEvents={events}
          calendarResources={resources}
          resourceEnabled={false}
          editable={true}
          selectable={true}
          slotDuration={15}
          currentTimeLine={true}
          onEventClick={handleEventClick}
          onEventChange={handleEventChange}
          onSlotSelect={handleSlotSelect}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          onNewEvent={handleNewEvent}
          businessHours={[
            {
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '08:00',
              endTime: '18:00',
            },
          ]}
          translations={{
            day: 'Day',
            week: 'Week',
            month: 'Month',
            today: 'Today',
            previous: 'Previous',
            next: 'Next',
            resourceTitle: 'Rooms',
            moreButtonLabel: 'more',
            allEventsTitle: 'All Events',
            newEvent: 'New Event',
          }}
        />
```
