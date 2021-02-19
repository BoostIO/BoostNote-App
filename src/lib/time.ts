import { format, formatDistanceToNowStrict, isValid } from 'date-fns'

const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = MS_PER_MINUTE * 60
const MS_PER_DAY = MS_PER_HOUR * 24
const MS_PER_MONTH = MS_PER_DAY * 30
const MS_PER_YEAR = MS_PER_DAY * 365

export const dateToRelativeString = (date: Date) => {
  const diffMS = new Date().getTime() - date.getTime()

  if (diffMS < MS_PER_MINUTE) {
    return `${Math.floor(diffMS / 1000)} seconds ago`
  }

  if (diffMS < MS_PER_HOUR) {
    return `${Math.floor(diffMS / MS_PER_MINUTE)} minutes ago`
  }

  if (diffMS < MS_PER_DAY) {
    return `${Math.floor(diffMS / MS_PER_HOUR)} hours ago`
  }

  if (diffMS < MS_PER_MONTH) {
    return `${Math.floor(diffMS / MS_PER_DAY)} days ago`
  }

  if (diffMS < MS_PER_YEAR) {
    return `${Math.floor(diffMS / MS_PER_MONTH)} months ago`
  }

  return `${Math.floor(diffMS / MS_PER_YEAR)} years ago`
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
