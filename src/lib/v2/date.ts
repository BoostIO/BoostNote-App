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
