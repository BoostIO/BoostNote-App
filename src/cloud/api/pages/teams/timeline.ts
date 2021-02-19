import { GeneralAppProps } from '../../../interfaces/api'
import { SerializedAppEvent } from '../../../interfaces/db/appEvents'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type TimelinePageData = GeneralAppProps & {
  events: SerializedAppEvent[]
}

export async function getTimelinePageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, teamId] = pathname.split('/')
  const data = await callApi<TimelinePageData>('api/pages/teams/timeline', {
    search: search + `&teamId=${teamId}`,
    signal,
  })

  return data
}
