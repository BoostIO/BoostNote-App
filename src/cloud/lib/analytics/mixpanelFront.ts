import { Mixpanel } from 'mixpanel-browser'

export function track(eventName: string, properties?: any) {
  const mixpanel = (window as any).mixpanel as Mixpanel
  if (mixpanel != null) {
    mixpanel.track(eventName, properties)
  }
}

export function trackAction(actionTrack: ActionTrackTypes, data: any) {
  switch (actionTrack) {
    case ActionTrackTypes.DocLayoutEdit:
      {
        const { docId, teamId } = data as DocTrackEvent
        track(ActionTrackTypes.DocLayoutEdit, {
          teamId: teamId,
          docId: docId,
        })
      }
      break
    default:
      break
  }
}

export enum ActionTrackTypes {
  DocLayoutEdit = 'doc.layout.edit',
}

export interface DocTrackEvent {
  docId: string
  teamId: string
}
