import { ChangeEventHandler } from 'react'

export type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>

function createCustomEventEmitter(name: string): {
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

interface BoostHubLoginEventDetail {
  code: string
}
export type BoostHubLoginEvent = CustomEvent<BoostHubLoginEventDetail>
export const boostHubLoginEventEmitter =
  createCustomEventEmitter<BoostHubLoginEventDetail>('BoostHub:login')
