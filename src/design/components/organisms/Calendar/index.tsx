import React from 'react'
import FullCalendar, {
  CustomContentGenerator,
  DateFormatter,
  DateSelectArg,
  DayCellContentArg,
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
    />
  )
}

export default Calendar
