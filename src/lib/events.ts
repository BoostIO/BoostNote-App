import { ChangeEventHandler } from 'react'

export type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>

function createCustomEventHelper(
  name: string
): {
  dispatch: () => void
  listen: (handler: (event: CustomEvent) => void) => void
  unlisten: (handler: (event: CustomEvent) => void) => void
}
function createCustomEventHelper<D = any>(
  name: string
): {
  dispatch: (detail: D) => void
  listen: (handler: (event: CustomEvent<D>) => void) => void
  unlisten: (handler: (event: CustomEvent<D>) => void) => void
}
function createCustomEventHelper<D = any>(name: string) {
  return {
    dispatch(detail: D) {
      window.dispatchEvent(new CustomEvent(name, { detail }))
    },
    listen(handler: (event: CustomEvent<D>) => void) {
      window.addEventListener(name, handler as (event: Event) => void)
    },
    unlisten(handler: (event: CustomEvent<D>) => void) {
      window.removeEventListener(name, handler as (event: Event) => void)
    },
  }
}

const NoteDetailFocusTitleInputEventName = 'NoteDetail:focusTitleInput'
export const {
  dispatch: dispatchNoteDetailFocusTitleInputEvent,
  listen: listenNoteDetailFocusTitleInputEvent,
  unlisten: unlistenNoteDetailFocusTitleInputEvent,
} = createCustomEventHelper(NoteDetailFocusTitleInputEventName)

const BoostHubLoginEventName = 'BoostHub:login'
interface BoostHubLoginEventDetail {
  code: string
}
export type BoostHubLoginEvent = CustomEvent<BoostHubLoginEventDetail>
export const {
  dispatch: dispatchBoostHubLoginEvent,
  listen: listenBoostHubLoginEvent,
  unlisten: unlistenBoostHubLoginEvent,
} = createCustomEventHelper<BoostHubLoginEventDetail>(BoostHubLoginEventName)

const BoostHubNavigateRequestEventName = 'BoostHub:navigateRequest'
interface BoostHubNavigateRequestEventDetail {
  url: string
}
export type BoostHubNavigateRequestEvent = CustomEvent<
  BoostHubNavigateRequestEventDetail
>
export const {
  dispatch: dispatchBoostHubNavigateRequestEvent,
  listen: listenBoostHubNavigateRequestEvent,
  unlisten: unlistenBoostHubNavigateRequestEvent,
} = createCustomEventHelper<BoostHubNavigateRequestEventDetail>(
  BoostHubNavigateRequestEventName
)
const BoostHubTeamCreateEventName = 'BoostHub:teamCreate'
interface BoostHubTeamCreateEventDetail {
  team: {
    id: string
    name: string
    domain: string
  }
}
export type BoostHubTeamCreateEvent = CustomEvent<BoostHubTeamCreateEventDetail>
export const {
  dispatch: dispatchBoostHubTeamCreateEvent,
  listen: listenBoostHubTeamCreateEvent,
  unlisten: unlistenBoostHubTeamCreateEvent,
} = createCustomEventHelper<BoostHubTeamCreateEventDetail>(
  BoostHubTeamCreateEventName
)
