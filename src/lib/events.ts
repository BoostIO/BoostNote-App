import { ChangeEventHandler } from 'react'

export type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>

const NoteDetailFocusTitleInputEventName = 'NoteDetail:focusTitleInput'

export function dispatchNoteDetailFocusTitleInputEvent() {
  window.dispatchEvent(new CustomEvent(NoteDetailFocusTitleInputEventName))
}

export function listenNoteDetailFocusTitleInputEvent(
  handler: (event: Event) => void
) {
  window.addEventListener(NoteDetailFocusTitleInputEventName, handler)
}

export function unlistenNoteDetailFocusTitleInputEvent(
  handler: (event: Event) => void
) {
  window.removeEventListener(NoteDetailFocusTitleInputEventName, handler)
}

const BoostHubLoginEventName = 'BoostHub:login'

interface BoostHubLoginEventDetail {
  code: string
}

export type BoostHubLoginEvent = CustomEvent<BoostHubLoginEventDetail>

export function dispatchBoostHubLoginEvent({ code }: BoostHubLoginEventDetail) {
  window.dispatchEvent(
    new CustomEvent(BoostHubLoginEventName, { detail: { code } })
  )
}

export function listenBoostHubLoginEvent(
  handler: (event: BoostHubLoginEvent) => void
) {
  window.addEventListener(
    BoostHubLoginEventName,
    handler as (event: Event) => void
  )
}

export function unlistenBoostHubLoginEvent(
  handler: (event: BoostHubLoginEvent) => void
) {
  window.removeEventListener(
    BoostHubLoginEventName,
    handler as (event: Event) => void
  )
}

const BoostHubNavigateRequestEventName = 'BoostHub:navigateRequest'

interface BoostHubNavigateRequestEventDetail {
  url: string
}

export type BoostHubNavigateRequestEvent = CustomEvent<
  BoostHubNavigateRequestEventDetail
>

export function dispatchBoostHubNavigateRequestEvent({
  url,
}: BoostHubNavigateRequestEventDetail) {
  window.dispatchEvent(
    new CustomEvent(BoostHubNavigateRequestEventName, { detail: { url } })
  )
}

export function listenBoostHubNavigateRequestEvent(
  handler: (event: BoostHubNavigateRequestEvent) => void
) {
  window.addEventListener(
    BoostHubNavigateRequestEventName,
    handler as (event: Event) => void
  )
}

export function unlistenBoostHubNavigateRequestEvent(
  handler: (event: BoostHubNavigateRequestEvent) => void
) {
  window.removeEventListener(
    BoostHubNavigateRequestEventName,
    handler as (event: Event) => void
  )
}
