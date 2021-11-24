import { format, formatDistanceToNowStrict, isValid } from 'date-fns'

export function getDateString(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function getWeeklyDateString(date: Date) {
  return format(date, 'yyyy-w')
}

export function getMonthlyDateString(date: Date) {
  return format(date, 'yyyy-MM')
}

export function getISODateString(date: Date | string) {
  const [dateString] = new Date(date).toISOString().split('T')

  return dateString
}

export function floorISOTime(date: Date | string) {
  return new Date(getISODateString(date) + 'T00:00:00.000Z')
}

export function getISODateFromLocalTime(date: Date | string) {
  return new Date(getDateString(new Date(date)) + 'T00:00:00.000Z')
}

export function getFormattedBoosthubDate(date: string, prefixed = false) {
  const converted = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  switch (converted > yesterday) {
    case true:
      return `${formatDistanceToNowStrict(converted)} ago`
    default:
      return `${prefixed ? 'on ' : ''}${format(converted, 'dd MMM, yyyy')}`
  }
}

export function getFormattedDateTime(
  date: string,
  prefix?: string,
  timeFormat = 'HH:mm, dd MMM'
) {
  const converted = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (!isValid(converted)) {
    return 'Invalid Date'
  }

  switch (converted > yesterday) {
    case true:
      return `${formatDistanceToNowStrict(converted)} ago`
    default:
      return `${prefix ? `${prefix} ` : ''}${format(
        new Date(converted),
        timeFormat
      )}`
  }
}

export function getFormattedBoosthubDateTime(date: string, prefixed = false) {
  const converted = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (!isValid(converted)) {
    return 'Invalid Date'
  }

  switch (converted > yesterday) {
    case true:
      return `${formatDistanceToNowStrict(converted)} ago`
    default:
      return `${prefixed ? 'on ' : ''}${format(converted, 'HH:mm, dd MMMM u')}`
  }
}
export function getShortFormattedBoosthubDateTime(date: string) {
  const converted = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (!isValid(converted)) {
    return 'Invalid Date'
  }

  switch (converted > yesterday) {
    case true:
      return `${formatDistanceToNowStrict(converted)} ago`
    default:
      return `${format(converted, 'dd MMM u')}`
  }
}

export function getUnixtimestamp(date: Date) {
  return date.getTime() / 1000
}

export function getFormattedDateFromUnixTimestamp(
  timestamp = 0,
  prefixed = false
) {
  return !timestamp
    ? timestamp
    : `${prefixed ? 'on ' : ''}${format(
        new Date(timestamp * 1000),
        'dd MMM, yyyy'
      )}`
}

export function compareDateString(date1: string, date2: string) {
  const a = date1.replace('-', '')
  const b = date2.replace('-', '')
  return a > b ? 1 : a < b ? -1 : 0
}
