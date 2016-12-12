# Key bindings

## Global

No global shortcuts are planned yet.

## Main

> Bolded Keys are set via Native Menu. It means you can not change these key by browser api.

Command             | macOS Key           | Windows/Linux Key    | Description
--------------------|---------------------|----------------------|-------------
main:new-note       | **Cmd - N**         | **Ctrl - N**         | Dispatch `title:new-note`
main:new-folder     | **Cmd - Shift - N** | **Ctrl - Shift - N** | Dispatch `nav:new-folder`
main:focus-search   | **Cmd - Alt - F**   | **Ctrl - Alt - F**   | Dispatch `title:focus-search`
main:focus-nav      |                     |                      | Dispatch `nav:focus`
main:focus-list     |                     |                      | Dispatch `list:focus`
main:focus-detail   |                     |                      | Dispatch `detail:focus`
main:find           | **Cmd - F**         | **Ctrl - F**         | Dispatch `detail:find`
main:hide           | **Cmd - W**         | **Ctrl - W**         | Hide window
main:quit           | **Cmd - Q**         | **Ctrl - Q**         | Quit app
main:delete         | **Backspace**       | **Delete**           | Dispatch `nav:delete` and `detail:delete`
main:refresh        | **Cmd - R**         | **Ctrl - R, F5**     | Refresh
main:preferences    | **Cmd - ,**         | **Ctrl - ,**         | Open Preferences window
main:print          | **Cmd - P**         | **Ctrl - P**         | Dispatch `detail:print`

## TitleBar

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
title:new-note      |                    |                   | Create a new note
title:focus-search  |                    |                   | Focus search input

## Nav(Left Navigator)

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
nav:new-note        | A                  | A                 | Dispatch `title:new-note`
nav:new-folder      | Shift - A          | Shift - A         | Create a new folder
nav:focus-list      | Enter              | Enter             | Dispatch `main:focus-list`
nav:focus           |                    |                   | Focus Nav
nav:up              | Up                 | Up                | Move up
nav:down            | Down               | Down              | Move down
nav:delete          | D                  | D                 | Delete a folder or storage(This event will called by `core:delete` event)


## List

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
list:focus-detail   | Enter              | Enter             | Dispatch `main:focus-detail`
list:focus-nav      | Esc                | Esc               | Dispatch `main:focus-nav`
list:focus          |                    |                   | Focus List
list:up             | Up                 | Up                | Move up
list:down           | Down               | Down              | Move down
list:delete         |                    |                   | Delete a note(This event will called by `core:delete` event)

## Detail

Command                 | macOS Key          | Windows/Linux Key | Description
------------------------|--------------------|-------------------|-------------
detail:focus-list       | Esc                | Esc               | Dispatch `main:focus-list`
detail:focus-tag-select | Cmd - '            | Ctrl - '          | Focus Tag Select
detail:focus            | Esc                | Esc               | Focus Detail
detail:find             |                    |                   | Find in note
detail:print            |                    |                   | Print
