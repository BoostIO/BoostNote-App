import React from 'react'
import FullCalendar, {
  CustomContentGenerator,
  DateFormatter,
  DateSelectArg,
  DayCellContentArg,
  Duration,
  EventApi,
  EventChangeArg,
  EventClickArg,
  EventContentArg,
  EventSourceInput,
  FormatterInput,
  ToolbarInput,
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

interface CalendarProps {
  headerToolbar?: ToolbarInput
  weekends?: boolean
  dayHeaderFormat?: FormatterInput | DateFormatter
  dayCellContent?: CustomContentGenerator<DayCellContentArg>
  eventContent?: CustomContentGenerator<EventContentArg>
  selectable?: boolean
  editable?: boolean
  events?: EventSourceInput
  select?: (arg: DateSelectArg) => void
  eventClick?: (arg: EventClickArg) => void
  eventResize?: (arg: {
    event: EventApi
    endDelta: Duration
    startDelta: Duration
  }) => void
  eventChange?: (arg: EventChangeArg) => void
  eventsSet?: (events: EventApi[]) => void
}

const Calendar = ({
  headerToolbar,
  dayHeaderFormat,
  dayCellContent,
  weekends = true,
  editable,
  selectable,
  eventContent,
  events,
  select,
  eventClick,
  eventChange,
  eventResize,
  eventsSet,
}: CalendarProps) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView={'dayGridMonth'}
      headerToolbar={headerToolbar}
      firstDay={1}
      weekends={weekends}
      events={events}
      dayHeaderFormat={dayHeaderFormat}
      dayCellContent={dayCellContent}
      selectable={selectable}
      selectMirror={true}
      editable={editable}
      eventContent={eventContent}
      select={select}
      eventClick={eventClick}
      eventResize={eventResize}
      eventChange={eventChange}
      eventsSet={eventsSet}
      defaultAllDay={true}
    />
  )
}

export default Calendar
