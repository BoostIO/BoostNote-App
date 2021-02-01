import { MixpanelFrontEvent } from '../../interfaces/analytics/mixpanel'
import { callApi } from '../../lib/client'

export async function trackEvent(
  eventName: MixpanelFrontEvent,
  data?: Record<string, any>
) {
  try {
    const response = await callApi('api/track', {
      json: { ...data, eventName },
      method: 'post',
    })
    return response.data
  } catch (err) {}
}
