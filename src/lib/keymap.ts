import { KeyboardEvent } from 'react'

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
}

export const defaultKeymap = new Map<string, KeymapItem>([
  [
    'toggleGlobalSearch',
    {
      shortcutMainStroke: {
        key: 'P',
        keycode: 80,
        modifiers: {
          ctrl: true,
        },
      },
      description: 'Toggles global search modal dialog',
      isMenuType: true,
    },
  ],
  [
    'toggleLocalSearch',
    {
      shortcutMainStroke: {
        key: 'F',
        keycode: 70,
        modifiers: {
          ctrl: true,
        },
      },
      description: 'Toggles local editor search modal dialog',
    },
  ],
  [
    'toggleLocalReplace',
    {
      shortcutMainStroke: {
        key: 'H',
        keycode: 72,
        modifiers: {
          ctrl: true,
        },
      },
      description: 'Toggles local editor replace modal dialog',
    },
  ],
  [
    'editorSaveAs',
    {
      shortcutMainStroke: {
        key: 'S',
        keycode: 83,
        modifiers: {
          ctrl: true,
        },
      },
      description: 'Export open document (save as)',
      isMenuType: true,
    },
  ],
  [
    'togglePreviewMode',
    {
      shortcutMainStroke: {
        key: 'E',
        keycode: 69,
        modifiers: {
          ctrl: true,
        },
      },
      description: 'Toggles preview mode in editor',
      isMenuType: true,
    },
  ],
  [
    'toggleSplitEditMode',
    {
      shortcutMainStroke: {
        key: '\\',
        keycode: 220,
        modifiers: {
          ctrl: true,
        },
      },
      description: 'Toggles split edit mode in editor',
      isMenuType: true,
    },
  ],
])

export function compareEventKeyWithKeymap(
  keymapProps: KeymapItem | undefined,
  event: KeyboardEvent<HTMLTextAreaElement>
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
    if (keymapProps.modifiers.ctrl != null) {
      keymapString += keymapProps.modifiers.ctrl ? 'Ctrl-' : ''
    }
    if (keymapProps.modifiers.shift != null) {
      keymapString += keymapProps.modifiers.shift ? 'Shift-' : ''
    }
    if (keymapProps.modifiers.alt != null) {
      keymapString += keymapProps.modifiers.alt ? 'Alt-' : ''
    }
    if (keymapProps.modifiers.meta != null) {
      keymapString += keymapProps.modifiers.meta ? 'Cmd-' : ''
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
  keymapString += keymapProps.key
  return keymapString
}
