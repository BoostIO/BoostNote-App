# Keymap and Commands

## Global

No global shortcuts are planned yet.

## Menu

> Shortcut of Native menu can not be modified by browser api.

### Keymap

macOS               | Windows/Linux        | Command via ipc or Action
--------------------|----------------------|-----------------------------
**Cmd - N**         | **Ctrl - N**         | `title:new-note` (ipc `new-note`)
**Cmd - Shift - N** | **Ctrl - Shift - N** | `nav:new-folder` (ipc `new-folder`)
**Backspace**       | **Delete**           | `nav:delete` and `detail:delete` (ipc `delete`)
**Cmd - Shift - F** | **Ctrl - Shift - F** | `title:focus-search` (ipc `focus-search`)
**Cmd - F**         | **Ctrl - F**         | `detail:find` (ipc `find`)
**Cmd - W**         | **Ctrl - W**         | Hide window
**Cmd - Q**         | **Ctrl - Q**         | Quit app
**Cmd - R**         | **Ctrl - R, F5**     | Refresh
**Cmd - ,**         | **Ctrl - ,**         | `title:preferences`
**Cmd - P**         | **Ctrl - P**         | `detail:print` (ipc `print`)

## Main

### Keymap

Empty by default

### Commands

Command             | Action
--------------------|---------------------
main:hide           | Hide window
main:quit           | Quit app
main:refresh        | Refresh

## TitleBar

### Keymap

Empty by default

> TitleBar can not be focused except search input is focused

### Commands

Command                  | Description
-------------------------|--------------------------
title:new-note           | Create a new note
title:focus-search       | Focus search input
title:open-preferences   | Open Preferences window

## Nav(Left Navigator)

### Keymap

macOS     | Windows/Linux | Command
----------|---------------|-----------------------------
A         | A             | `title:new-note`
Shift - A | Shift - A     | `nav:new-folder`
Enter     | Enter         | `list:focus`
Right     | Right         | `list:focus`
Up        | Up            | `nav:up`
Down      | Down          | `nav:down`
D         | D             | `nav:delete`

### Commands

Command             | Action
--------------------|--------------------------
nav:new-folder      | Craeate a new folder
nav:focus           | Focus Nav
nav:up              | Move up
nav:down            | Move down
nav:delete          | Delete a folder or storage

## List

### Keymap

macOS    | Windows/Linux | Command
---------|---------------|-----------------------------
Enter    | Enter         | `detail:focus`
E        | E             | `detail:focus`
Right    | Right         | `detail:focus`
Esc      | Esc           | `nav:focus`
Left     | Left          | `nav:focus`
Up       | Up            | `list:up`
Down     | Down          | `list:down`
D        | D             | `list:delete`

### Commands

Command             | Action
--------------------|------------------------
list:focus          | Focus List
list:up             | Move up
list:down           | Move down
list:delete         | Delete a note

## Detail

### Keymap

macOS    | Windows/Linux | Command
---------|---------------|-----------------------------
Esc      | Esc           | `list:focus`
Cmd - '  | Ctrl - '      | `detail:focus-tag-select`

### Commands

Command                 | Action
------------------------|----------------------------
detail:focus-tag-select | Focus tag select
detail:focus            | Focus Detail
detail:find             | Start finding
detail:print            | Print
