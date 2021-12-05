import { osName } from '../design/lib/platform'

interface ModifierItem {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

export interface KeymapItemEditableProps {
  key: string
  keycode: number
  modifiers?: ModifierItem
}

export interface KeymapItem {
  shortcutMainStroke?: KeymapItemEditableProps
  shortcutSecondStroke?: KeymapItemEditableProps
  description: string
  isMenuType?: boolean
  desktopOnly?: boolean
}

export const defaultKeymap = new Map<string, KeymapItem>([
  [
    'createNewDoc',
    {
      shortcutMainStroke: {
        key: 'n',
        keycode: 78,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Create new document',
      isMenuType: true,
      desktopOnly: true,
    },
  ],
  // todo: [komediruzecki-2021-12-5] Enable when available
  // [
  //   'createNewFolder',
  //   {
  //     shortcutMainStroke: {
  //       key: 'N',
  //       keycode: 78,
  //       modifiers:
  //         osName === 'macos'
  //           ? { meta: true, shift: true }
  //           : {
  //               ctrl: true,
  //               shift: true,
  //             },
  //     },
  //     description: 'Create new folder',
  //     isMenuType: true,
  //     desktopOnly: true,
  //   },
  // ],
  [
    'toggleSideNav',
    {
      shortcutMainStroke: {
        key: '0',
        keycode: 48,
        modifiers:
          osName === 'macos'
            ? { meta: true, shift: true }
            : {
                ctrl: true,
                shift: true,
              },
      },
      description: 'Toggle side nav',
    },
  ],
  [
    'toggleGlobalSearch',
    {
      shortcutMainStroke: {
        key: 'p',
        keycode: 80,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Toggle global search modal dialog',
      isMenuType: true,
    },
  ],
  [
    'toggleInPageSearch',
    {
      shortcutMainStroke: {
        key: 'F',
        keycode: 70,
        modifiers:
          osName === 'macos'
            ? { meta: true, shift: true }
            : {
                ctrl: true,
                shift: true,
              },
      },
      description: 'Toggle in-page search modal dialog',
      desktopOnly: true,
    },
  ],
  // todo: [komediruzecki-2021-11-7] enable once implemented
  // [
  //   'toggleLocalSearch',
  //   {
  //     shortcutMainStroke: {
  //       key: 'F',
  //       keycode: 70,
  //       modifiers:
  //         osName === 'macos'
  //           ? { meta: true }
  //           : {
  //               ctrl: true,
  //             },
  //     },
  //     description: 'Toggle local editor search modal dialog',
  //   },
  // ],
  // [
  //   'toggleLocalReplace',
  //   {
  //     shortcutMainStroke: {
  //       key: 'F',
  //       keycode: 70,
  //       modifiers:
  //         osName === 'macos'
  //           ? { meta: true, alt: true }
  //           : {
  //               ctrl: true,
  //               alt: true,
  //             },
  //     },
  //     description: 'Toggle local editor replace modal dialog',
  //   },
  // ],
  // todo: [komediruzecki-2021-11-7] enable once implemented
  // [
  //   'editorSaveAs',
  //   {
  //     shortcutMainStroke: {
  //       key: 'S',
  //       keycode: 83,
  //       modifiers:
  //         osName === 'macos'
  //           ? { meta: true }
  //           : {
  //               ctrl: true,
  //             },
  //     },
  //     description: 'Export open document (save as)',
  //     isMenuType: true,
  //   },
  // ],
  [
    'togglePreviewMode',
    {
      shortcutMainStroke: {
        key: 'e',
        keycode: 69,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Toggle preview mode in editor',
      isMenuType: true,
    },
  ],
  [
    'toggleSplitEditMode',
    {
      shortcutMainStroke: {
        key: '\\',
        keycode: 220,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Toggles split edit mode in editor',
      isMenuType: true,
    },
  ],
  [
    'zoomIn',
    {
      shortcutMainStroke: {
        key: '+',
        keycode: 61,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Zoom in window',
      isMenuType: true,
      desktopOnly: true,
    },
  ],
  [
    'zoomOut',
    {
      shortcutMainStroke: {
        key: '-',
        keycode: 173,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Zoom out window',
      isMenuType: true,
      desktopOnly: true,
    },
  ],
  [
    'resetZoom',
    {
      shortcutMainStroke: {
        key: '0',
        keycode: 48,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Reset window zoom',
      isMenuType: true,
      desktopOnly: true,
    },
  ],
  // todo: [komediruzecki-2021-11-7] Enable once implemented
  // [
  //   'focusEditor',
  //   {
  //     shortcutMainStroke: {
  //       key: 'J',
  //       keycode: 74,
  //       modifiers:
  //         osName === 'macos'
  //           ? { meta: true }
  //           : {
  //               ctrl: true,
  //             },
  //     },
  //     description: 'Focus document editor',
  //     isMenuType: true,
  //   },
  // ],
  // [
  //   'focusDocTitle',
  //   {
  //     shortcutMainStroke: {
  //       key: 'J',
  //       keycode: 74,
  //       modifiers:
  //         osName === 'macos'
  //           ? { meta: true, shift: true }
  //           : {
  //               ctrl: true,
  //               shift: true,
  //             },
  //     },
  //     description: 'Focus document title',
  //     isMenuType: true,
  //   },
  // ],
  [
    'openPreferences',
    {
      shortcutMainStroke: {
        key: ',',
        keycode: 188,
        modifiers:
          osName === 'macos'
            ? { meta: true }
            : {
                ctrl: true,
              },
      },
      description: 'Open Preferences',
      isMenuType: true,
    },
  ],
  // todo: [komediruzecki-2021-11-7] Enable when feature implemented
  // initially un-assigned list
  // [
  //   'insertLocaleDateString',
  //   {
  //     description: 'Insert locale date',
  //     isMenuType: false,
  //   },
  // ],
  // [
  //   'insertDateAndTimeString',
  //   {
  //     description: 'Insert date and time',
  //     isMenuType: false,
  //   },
  // ],
])

export function compareEventKeyWithKeymap(
  keymapProps: KeymapItem | undefined,
  event: KeyboardEvent
) {
  if (keymapProps == null || keymapProps.shortcutMainStroke == null) {
    return
  }
  const eventProps: KeymapItemEditableProps = {
    key: event.key.toUpperCase(),
    modifiers: {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    },
    keycode: event.keyCode,
  }
  return areShortcutsEqual(keymapProps.shortcutMainStroke, eventProps)
}

export function createCodemirrorTypeKeymap(
  keymapProps: KeymapItemEditableProps
) {
  let keymapString = ''
  if (keymapProps.modifiers != null) {
    if (keymapProps.modifiers.shift != null) {
      keymapString += keymapProps.modifiers.shift ? 'Shift-' : ''
    }
    if (keymapProps.modifiers.meta != null) {
      keymapString += keymapProps.modifiers.meta ? 'Cmd-' : ''
    }
    if (keymapProps.modifiers.ctrl != null) {
      keymapString += keymapProps.modifiers.ctrl ? 'Ctrl-' : ''
    }
    if (keymapProps.modifiers.alt != null) {
      keymapString += keymapProps.modifiers.alt ? 'Alt-' : ''
    }
  }

  const keyLowercase = keymapProps.key.toLowerCase()
  if (
    keyLowercase != 'control' &&
    keyLowercase != 'shift' &&
    keyLowercase != 'alt' &&
    keyLowercase != 'meta'
  ) {
    keymapString += keymapProps.key
  }
  return keymapString
}

function convertNullToFalse(value?: boolean) {
  return value == null ? false : value
}

function areShortcutsEqual(
  first: KeymapItemEditableProps,
  second: KeymapItemEditableProps
) {
  if (first.keycode != second.keycode || first.key != second.key) {
    return false
  }
  if (first.modifiers && second.modifiers) {
    if (
      convertNullToFalse(first.modifiers.ctrl) !=
      convertNullToFalse(second.modifiers.ctrl)
    ) {
      return false
    }

    if (
      convertNullToFalse(first.modifiers.shift) !=
      convertNullToFalse(second.modifiers.shift)
    ) {
      return false
    }
    if (
      convertNullToFalse(first.modifiers.alt) !=
      convertNullToFalse(second.modifiers.alt)
    ) {
      return false
    }
  } else {
    if (
      (first.modifiers == null && second.modifiers != null) ||
      (first.modifiers != null && second.modifiers == null)
    ) {
      return false
    }
  }

  return true
}

export function findExistingShortcut(
  shortcutKey: string,
  shortcut: KeymapItemEditableProps,
  keymap: Map<string, KeymapItem>
) {
  for (const [key, keymapShortcut] of keymap) {
    if (key == shortcutKey) {
      continue
    }
    if (keymapShortcut.shortcutMainStroke != null) {
      if (areShortcutsEqual(shortcut, keymapShortcut.shortcutMainStroke)) {
        return true
      }
    }
  }
  return false
}

export function isMenuKeymap(keymapItem: KeymapItem): boolean {
  return convertNullToFalse(keymapItem.isMenuType)
}

export function getGenericShortcutString(
  shortcut: KeymapItemEditableProps
): string {
  return createCodemirrorTypeKeymap(shortcut)
}

export function getMenuAcceleratorKeymapKey(key: string): string {
  switch (key) {
    default:
      return key
    case '+':
      return 'Plus'
    case ' ':
      return 'Space'
    case '\t':
      return 'Tab'
  }
}

export function getMenuAcceleratorForKeymapItem(
  keymapItem: KeymapItem
): string {
  const keymapProps = keymapItem.shortcutMainStroke
  if (keymapProps == null) {
    return ''
  }
  let keymapString = ''
  if (keymapProps.modifiers != null) {
    if (keymapProps.modifiers.ctrl != null) {
      keymapString += keymapProps.modifiers.ctrl ? 'Ctrl + ' : ''
    }
    if (keymapProps.modifiers.shift != null) {
      keymapString += keymapProps.modifiers.shift ? 'Shift + ' : ''
    }
    if (keymapProps.modifiers.alt != null) {
      keymapString += keymapProps.modifiers.alt ? 'Alt + ' : ''
    }
    if (keymapProps.modifiers.meta != null) {
      keymapString += keymapProps.modifiers.meta ? 'Meta + ' : ''
    }
  }

  const menuKeymapKey = getMenuAcceleratorKeymapKey(keymapProps.key)
  keymapString += menuKeymapKey
  return keymapString
}
