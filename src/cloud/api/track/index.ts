import { MixpanelFrontEvent } from '../../interfaces/analytics/mixpanel'
import { callApi } from '../../lib/client'
import { mockBackend } from '../../lib/consts'

export async function trackEvent(
  eventName: MixpanelFrontEvent,
  data?: Record<string, any>
) {
  if (mockBackend) {
    return
  }
  try {
    return callApi('api/track', {
      json: { ...data, eventName },
      method: 'post',
    })
  } catch (err) {}
}
