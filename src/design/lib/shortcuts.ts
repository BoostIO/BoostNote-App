import { isWithGeneralCtrlKey } from './keyboard'
import { isActiveElementAnInput } from './dom'

/** GLOBAL **/

export function isFocusLeftSideShortcut(event: KeyboardEvent) {
  // cmd + shift + arrowRight
  return (
    event.key.toLowerCase() === 'arrowleft' &&
    event.shiftKey &&
    isWithGeneralCtrlKey(event) &&
    !isActiveElementAnInput()
  )
}
export function isFocusRightSideShortcut(event: KeyboardEvent) {
  // cmd + shift + arrowRight
  return (
    event.key.toLowerCase() === 'arrowright' &&
    event.shiftKey &&
    isWithGeneralCtrlKey(event) &&
    !isActiveElementAnInput()
  )
}
