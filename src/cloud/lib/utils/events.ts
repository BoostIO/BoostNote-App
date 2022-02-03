import React, { ChangeEventHandler, EventHandler } from 'react'

export type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>
export type ButtonClickEventHandler = EventHandler<React.MouseEvent>

export function createCustomEventEmitter(name: string): {
  dispatch: () => void
  listen: (handler: (event: CustomEvent) => void) => void
  unlisten: (handler: (event: CustomEvent) => void) => void
}
export function createCustomEventEmitter<D = any>(
  name: string
): {
  dispatch: (detail: D) => void
  listen: (handler: (event: CustomEvent<D>) => void) => void
  unlisten: (handler: (event: CustomEvent<D>) => void) => void
}
export function createCustomEventEmitter<D = any>(name: string) {
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

export const toggleSettingsEventEmitter =
  createCustomEventEmitter('toggle-settings')

export const newDocEventEmitter = createCustomEventEmitter('new-doc')

export const newFolderEventEmitter = createCustomEventEmitter('new-folder')

export const searchEventEmitter = createCustomEventEmitter('search')

export const toggleSideNavigatorEventEmitter = createCustomEventEmitter(
  'toggle-side-navigator'
)

export const focusTitleEventEmitter = createCustomEventEmitter('focus-title')

export const focusEditorEventEmitter = createCustomEventEmitter('focus-editor')

export const focusEditorHeadingEventEmitter = createCustomEventEmitter<{
  heading: string
}>('focus-editor-location')

export const togglePreviewModeEventEmitter = createCustomEventEmitter(
  'toggle-preview-mode'
)

export const toggleSplitEditModeEventEmitter = createCustomEventEmitter(
  'toggle-split-edit-mode'
)

export const applyBoldStyleEventEmitter =
  createCustomEventEmitter('apply-bold-style')

export const applyItalicStyleEventEmitter =
  createCustomEventEmitter('apply-italic-style')

export const toggleSidebarSearchEventEmitter =
  createCustomEventEmitter('sidebar-search')

export const toggleSidebarNotificationsEventEmitter = createCustomEventEmitter(
  'sidebar-notifications'
)

export const toggleSettingsMembersEventEmitter = createCustomEventEmitter(
  'toggle-settings-members'
)

export type BlockEventDetails = {
  blockId: string
  blockType: 'markdown' | 'embed' | 'table' | 'container' | 'github.issue'
  event: 'creation'
}

export const blockEventEmitter =
  createCustomEventEmitter<BlockEventDetails>('blocks-events')

export type ResourceDeleteEventDetails = {
  resourceType: 'doc' | 'workspace' | 'folder'
  resourceId: string
  parentURL: string
}

export const resourceDeleteEventEmitter =
  createCustomEventEmitter<ResourceDeleteEventDetails>('delete-resource')

export type SwitchSpaceEventDetails = {
  index: number
}

export const switchSpaceEventEmitter =
  createCustomEventEmitter<SwitchSpaceEventDetails>('switch-space')

export type SignInViaAccessTokenDetails = {
  accessToken: string
}

export const signInViaAccessTokenEventEmitter =
  createCustomEventEmitter<SignInViaAccessTokenDetails>(
    'sign-in-via-access-token'
  )

export const modalEventEmitter =
  createCustomEventEmitter<ModalEventDetails>('modal')

export type ModalEventDetails = {
  type: string
}

export type PagePropsUpdateEventDetails = {
  pageProps: any
}

export const PagePropsUpdateEventEmitter =
  createCustomEventEmitter<PagePropsUpdateEventDetails>('page-props-update')
