import { MixpanelFrontEvent } from '../../interfaces/analytics/mixpanel'
import { callApi } from '../../lib/client'

export async function trackEvent(
  eventName: MixpanelFrontEvent,
  data?: Record<string, any>
) {
  try {
    return callApi('api/track', {
      json: { ...data, eventName },
      method: 'post',
    })
  } catch (err) {}
}
