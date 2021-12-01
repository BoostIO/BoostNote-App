import React from 'react'
import FullCalendar, {
  DateFormatter,
  FormatterInput,
  ToolbarInput,
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

interface CalendarProps {
  headerToolbar?: ToolbarInput
  weekends?: boolean
  dayHeaderFormat?: FormatterInput | DateFormatter
}

const Calendar = ({
  headerToolbar,
  dayHeaderFormat,
  weekends = true,
}: CalendarProps) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView={'dayGridMonth'}
      headerToolbar={headerToolbar}
      firstDay={1}
      weekends={weekends}
      dayHeaderFormat={dayHeaderFormat}
    />
  )
}

export default Calendar
