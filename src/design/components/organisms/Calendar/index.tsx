import React from 'react'
import FullCalendar, {
  AllowFunc,
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
  className?: string
  headerToolbar?: ToolbarInput
  weekends?: boolean
  dayHeaderFormat?: FormatterInput | DateFormatter
  dayCellContent?: CustomContentGenerator<DayCellContentArg>
  eventContent?: CustomContentGenerator<EventContentArg>
  selectable?: boolean
  editable?: boolean
  events?: EventSourceInput
  dropAccept?: string
  droppable?: boolean
  select?: (arg: DateSelectArg) => void
  eventClick?: (arg: EventClickArg) => void
  eventResize?: (arg: {
    event: EventApi
    endDelta: Duration
    startDelta: Duration
  }) => void
  eventChange?: (arg: EventChangeArg) => void
  eventsSet?: (events: EventApi[]) => void
  eventReceive?: (arg: any) => void
  eventAllow?: AllowFunc
}

const Calendar = ({
  className,
  headerToolbar,
  dayHeaderFormat,
  dayCellContent,
  weekends = true,
  editable,
  selectable,
  eventContent,
  events,
  droppable,
  dropAccept,
  select,
  eventClick,
  eventChange,
  eventResize,
  eventsSet,
  eventReceive,
  eventAllow,
}: CalendarProps) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView={'dayGridMonth'}
      headerToolbar={headerToolbar}
      firstDay={1}
      weekends={weekends}
      events={events}
      viewClassNames={className}
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
      droppable={droppable}
      dropAccept={dropAccept}
      eventAllow={eventAllow}
      eventReceive={eventReceive}
    />
  )
}

export default Calendar
