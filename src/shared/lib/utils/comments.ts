import { mdiAlertCircleOutline, mdiAlertCircleCheckOutline } from '@mdi/js'
import { Thread } from '../../../cloud/interfaces/db/comments'

export function highlightComment(id: string, className = 'active') {
  return () =>
    document
      .querySelectorAll(`[data-inline-comment="${id}"]`)
      .forEach((element) => element.classList.add(className))
}

export function unhighlightComment(id: string, className = 'active') {
  return () =>
    document
      .querySelectorAll(`[data-inline-comment="${id}"]`)
      .forEach((element) => element.classList.remove(className))
}

export function getStatusIcon(status: Thread['status']['type']) {
  switch (status) {
    case 'open':
      return ['success' as const, mdiAlertCircleOutline]
    case 'closed':
      return ['danger' as const, mdiAlertCircleCheckOutline]
    case 'outdated':
      return ['secondary' as const, mdiAlertCircleCheckOutline]
  }
}

interface StatusPartition {
  open: Thread[]
  closed: Thread[]
  outdated: Thread[]
}

export function partitionOnStatus(threads: Thread[]): StatusPartition {
  const partitioned: StatusPartition = { open: [], closed: [], outdated: [] }
  for (const thread of threads) {
    partitioned[thread.status.type].push(thread)
  }
  return partitioned
}
