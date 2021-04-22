import { formatDistanceToNowStrict, isValid, format } from 'date-fns'

export function compareDateString(
  date1: string,
  date2: string,
  order: 'ASC' | 'DESC'
) {
  const a = date1.replace('-', '')
  const b = date2.replace('-', '')

  if (order === 'DESC') {
    return a > b ? -1 : a < b ? 1 : 0
  }

  return a > b ? 1 : a < b ? -1 : 0
}

export function getFormattedDateTime(date: string, prefixed = false) {
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
      return `${prefixed ? 'on ' : ''}${format(converted, 'MMM dd')}`
  }
}

export function getDateTime(
  date: string,
  prefixed: boolean,
  dateFormat = 'HH:mm, dd MMMM u'
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
      return `${prefixed ? 'on ' : ''}${format(converted, dateFormat)}`
  }
}
