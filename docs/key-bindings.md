# Key bindings

## Global

No global shortcuts are planned yet.

## Main

> Bolded Keys are set via Native Menu. It means you can not change these key by browser api.

Command             | macOS Key           | Windows/Linux Key    | Description
--------------------|---------------------|----------------------|-------------
main:new-note       | **Cmd - N**         | **Ctrl - N**         | Fire `title:new-note`
main:new-folder     | **Cmd - Shift - N** | **Ctrl - Shift - N** | Fire `nav:new-folder`
main:focus-search   | **Cmd - P**         | **Ctrl - P**         | Focus search input
main:hide-window    | **Cmd - W**         | **Ctrl - W**         | Hide window
main:quit           | **Cmd - Q**         | **Ctrl - Q**         | Quit app
main:delete         | **Backspace**       | **Delete**           | Fire `nav:delete` and `detail:delete`
main:refresh        | **Cmd - R**         | **Ctrl - R, F5**     | Refresh
main:preferences    | **Cmd - ,**         | **Ctrl - ,**         | Open Preferences window

## TitleBar

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
title:new-note      |                    |                   | Create a new note

## Nav(Left Navigator)

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
nav:new-note        | A                  | A                 | Fire `title:new-note`
nav:new-folder      | Shift - A          | Shift - A         | Create a new folder
nav:focus-list      | Enter              | Enter             | Focus List
nav:up              | Up                 | Up                | Move up
nav:down            | Down               | Down              | Move down
nav:delete          | D                  | D                 | Delete a folder or storage(This event will called by `core:delete` event)


## List

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
list:focus-editor   | Enter              | Enter             | Focus Detail
list:focus-nav      | Esc                | Esc               | Focus Editor
list:up             | Up                 | Up                | Move up
list:down           | Down               | Down              | Move down
list:delete         |                    |                   | Delete a note(This event will called by `core:delete` event)

## Editor

Command                 | macOS Key          | Windows/Linux Key | Description
------------------------|--------------------|-------------------|-------------
editor:focus-editor     | Esc                | Esc               | Focus List
editor:focus-tag-select | Cmd - '            | Ctrl - '          | Focus Tag Select
editor:find             | Cmd - f            | Ctrl - f          | Find in note
