import React from 'react'
import FullCalendar, {
  CustomContentGenerator,
  DateFormatter,
  DayCellContentArg,
  EventContentArg,
  EventSourceInput,
  FormatterInput,
  ToolbarInput,
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

interface CalendarProps {
  headerToolbar?: ToolbarInput
  weekends?: boolean
  dayHeaderFormat?: FormatterInput | DateFormatter
  dayCellContent?: CustomContentGenerator<DayCellContentArg>
  eventContent?: CustomContentGenerator<EventContentArg>
  selectable?: boolean
  editable?: boolean
  events?: EventSourceInput
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
}: CalendarProps) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView={'dayGridMonth'}
      headerToolbar={headerToolbar}
      firstDay={1}
      weekends={weekends}
      events={events}
      dayHeaderFormat={dayHeaderFormat}
      dayCellContent={dayCellContent}
      selectable={selectable}
      editable={editable}
      eventContent={eventContent}
    />
  )
}

export default Calendar
