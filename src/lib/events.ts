import { ChangeEventHandler } from 'react'

export type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>

function createCustomEventEmitter(
  name: string
): {
  dispatch: () => void
  listen: (handler: (event: CustomEvent) => void) => void
  unlisten: (handler: (event: CustomEvent) => void) => void
}
function createCustomEventEmitter<D = any>(
  name: string
): {
  dispatch: (detail: D) => void
  listen: (handler: (event: CustomEvent<D>) => void) => void
  unlisten: (handler: (event: CustomEvent<D>) => void) => void
}
function createCustomEventEmitter<D = any>(name: string) {
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

export const noteDetailFocusTitleInputEventEmitter = createCustomEventEmitter(
  'NoteDetail:focusTitleInput'
)

export const boostHubLoginRequestEventEmitter = createCustomEventEmitter(
  'BoostHub:loginRequest'
)

interface BoostHubLoginEventDetail {
  code: string
}
export type BoostHubLoginEvent = CustomEvent<BoostHubLoginEventDetail>
export const boostHubLoginEventEmitter = createCustomEventEmitter<
  BoostHubLoginEventDetail
>('BoostHub:login')

interface BoostHubNavigateRequestEventDetail {
  url: string
}
export type BoostHubNavigateRequestEvent = CustomEvent<
  BoostHubNavigateRequestEventDetail
>
export const boostHubNavigateRequestEventEmitter = createCustomEventEmitter<
  BoostHubNavigateRequestEventDetail
>('BoostHub:navigateRequest')

interface BoostHubTeamCreateEventDetail {
  team: {
    id: string
    name: string
    domain: string
    icon?: {
      location: string
    }
  }
}
export type BoostHubTeamCreateEvent = CustomEvent<BoostHubTeamCreateEventDetail>
export const boostHubTeamCreateEventEmitter = createCustomEventEmitter<
  BoostHubTeamCreateEventDetail
>('BoostHub:teamCreate')

const BoostHubTeamUpdateEventName = 'BoostHub:teamUpdate'
interface BoostHubTeamUpdateEventDetail {
  team: {
    id: string
    name: string
    domain: string
    icon?: {
      location: string
    }
  }
}
export type BoostHubTeamUpdateEvent = CustomEvent<BoostHubTeamUpdateEventDetail>
export const {
  dispatch: dispatchBoostHubTeamUpdateEvent,
  listen: listenBoostHubTeamUpdateEvent,
  unlisten: unlistenBoostHubTeamUpdateEvent,
} = createCustomEventEmitter<BoostHubTeamUpdateEventDetail>(
  BoostHubTeamUpdateEventName
)

const BoostHubTeamDeleteEventName = 'BoostHub:teamDelete'
interface BoostHubTeamDeleteEventDetail {
  team: {
    id: string
    name: string
    domain: string
    icon?: {
      location: string
    }
  }
}
export type BoostHubTeamDeleteEvent = CustomEvent<BoostHubTeamDeleteEventDetail>
export const {
  dispatch: dispatchBoostHubTeamDeleteEvent,
  listen: listenBoostHubTeamDeleteEvent,
  unlisten: unlistenBoostHubTeamDeleteEvent,
} = createCustomEventEmitter<BoostHubTeamDeleteEventDetail>(
  BoostHubTeamDeleteEventName
)

const BoostHubAccountDeleteEventName = 'BoostHub:accountDelete'
export type BoostHubAccountDeleteEvent = CustomEvent
export const {
  dispatch: dispatchBoostHubAccountDeleteEvent,
  listen: listenBoostHubAccountDeleteEvent,
  unlisten: unlistenBoostHubAccountDeleteEvent,
} = createCustomEventEmitter(BoostHubAccountDeleteEventName)

const BoostHubToggleSettingsEventName = 'BoostHub:toggleSettings'
export type BoostHubToggleSettingsEvent = CustomEvent
export const {
  dispatch: dispatchBoostHubToggleSettingsEvent,
  listen: listenBoostHubToggleSettingsEvent,
  unlisten: unlistenBoostHubToggleSettingsEvent,
} = createCustomEventEmitter(BoostHubToggleSettingsEventName)
