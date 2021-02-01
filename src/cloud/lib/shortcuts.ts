import {
  isWithGeneralCtrlKey,
  isSingleKeyEventOutsideOfInput,
} from './keyboard'
import { isActiveElementAnInput } from './dom'

export enum shortcuts {
  bookmarkDoc = 'b',
  bookmarkFolder = 'b',
  help = 'h',
  editDoc = 'e',
  editFolder = 'e',
  foldFolder = 'arrowleft',
  newFolder = 'f',
  newDocument = 'n',
  unfoldFolder = 'arrowright',
  userInfo = ',',
  teamPicker = 's',
  teamMembers = 'i',
  search = 'p',
}

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

export function isShowHelpShortcut(event: KeyboardEvent) {
  return (
    isWithGeneralCtrlKey(event) && event.key.toLowerCase() === shortcuts.help
  )
}

export function isGlobalSearchShortcut(event: KeyboardEvent) {
  return (
    event.key.toLowerCase() === shortcuts.search && isWithGeneralCtrlKey(event)
  )
}

/*** EDIT SESSION ***/
export function isEditSessionSaveShortcut(event: KeyboardEvent) {
  return event.key.toLowerCase() === 'enter' && isWithGeneralCtrlKey(event)
}

export function isEditSessionExitShortcut(event: KeyboardEvent) {
  return event.key.toLowerCase() === 'escape' && isWithGeneralCtrlKey(event)
}

export function isEditSessionResetShortcut(event: KeyboardEvent) {
  return event.key.toLowerCase() === 'u' && isWithGeneralCtrlKey(event)
}

// ** DOCS ** //

export function isDocCreateShortcut(event: KeyboardEvent) {
  return isSingleKeyEventOutsideOfInput(event, shortcuts.newDocument)
}
export function isDocDeleteShortcut(event: KeyboardEvent) {
  return (
    event.key.toLowerCase() === 'backspace' &&
    event.shiftKey &&
    isWithGeneralCtrlKey(event)
  )
}
export function isDocBookmarkShortcut(event: KeyboardEvent) {
  return isSingleKeyEventOutsideOfInput(event, shortcuts.bookmarkDoc)
}
// ** FOLDERS ** //

export function isFolderCreateShortcut(event: KeyboardEvent) {
  return isSingleKeyEventOutsideOfInput(event, shortcuts.newFolder)
}

export function isFolderEditShortcut(event: KeyboardEvent) {
  return isSingleKeyEventOutsideOfInput(event, shortcuts.editFolder)
}

export function isFolderDeleteShortcut(event: KeyboardEvent) {
  return (
    event.key.toLowerCase() === 'backspace' &&
    event.shiftKey &&
    isWithGeneralCtrlKey(event)
  )
}
export function isFolderBookmarkShortcut(event: KeyboardEvent) {
  return isSingleKeyEventOutsideOfInput(event, shortcuts.bookmarkFolder)
}
