import { Notification } from '../../interfaces/db/notifications'
import { callApi } from '../../lib/client'

type SerializedNotification = Notification & {
  createdAt: string
  viewedAt?: string
}

interface Pagination {
  page: number
  perPage: number
}

interface ListNotificationResponseBody {
  notifications: SerializedNotification[]
  counts: {
    total: number
    teams: Record<string, number>
  }
}

interface ListFilters {
  viewed?: boolean
  team?: string
  before?: Date
  after?: Date
}

export async function listNotifications(
  filters: ListFilters = {},
  pagination?: Pagination
): Promise<{
  notifications: Notification[]
  counts: ListNotificationResponseBody['counts']
}> {
  const search = new URLSearchParams()

  if (filters.viewed != null) {
    search.append('viewed', filters.viewed ? 'true' : 'false')
  }

  if (filters.team != null) {
    search.append('team', filters.team)
  }

  if (filters.before != null) {
    search.append('before', filters.before.toJSON())
  }

  if (filters.after != null) {
    search.append('after', filters.after.toJSON())
  }

  if (pagination != null) {
    search.append('page', pagination.page.toString())
    search.append('perPage', pagination.perPage.toString())
  }

  const { notifications, counts } = await callApi<ListNotificationResponseBody>(
    `api/notifications`,
    {
      search,
    }
  )

  return {
    notifications: notifications.map(deserialize),
    counts,
  }
}

interface GetNotificationResponseBody {
  notification: SerializedNotification
}

export async function getNotification(id: string): Promise<Notification> {
  const { notification } = await callApi<GetNotificationResponseBody>(
    `api/notifications/${id}`
  )
  return deserialize(notification)
}

interface SetNotificationViewedResponseBody {
  notification: SerializedNotification
}

export async function setNotificationViewed(toSetViewed: Notification) {
  const { notification } = await callApi<SetNotificationViewedResponseBody>(
    `api/notifications/${toSetViewed.id}`,
    { method: 'patch', json: { viewed: true } }
  )
  return deserialize(notification)
}

function deserialize(serialized: SerializedNotification): Notification {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
    viewedAt:
      serialized.viewedAt != null ? new Date(serialized.viewedAt) : undefined,
  }
}
