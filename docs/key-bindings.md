# Key bindings

## Global

No global shortcuts are planned yet.

## In App

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
core:new-note       | Cmd + N            | Ctrl + N          | Create a new note
core:new-folder     | Cmd + Shift + N    | Ctrl + Shift + N  | Create a new folder
core:focus-search   | Cmd + P            | Ctrl + P          | Focus search input
core:hide-window    | Cmd + W            | Ctrl + W          | Hide window
core:quit           | Cmd + Q            | Ctrl + Q          | Quit app
core:delete         | Cmd + Backspace    | Delete            | Delete
core:refresh        | Cmd + R            | Ctrl + R, F5      | Delete

## Nav(Left Navigator)

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
nav:focus-list      | Enter              | Enter             | Focus List
nav:up              | Up                 | Up                | Move up
nav:down            | Down               | Down              | Move down
nav:delete          | -                  | -                 | Delete a folder or storage(This event will called by `core:delete` event)


## List

Command             | macOS Key          | Windows/Linux Key | Description
--------------------|--------------------|-------------------|-------------
list:focus-editor   | Enter              | Enter             | Focus Detail
list:focus-nav      | Esc                | Esc               | Focus Editor
list:up             | Up                 | Up                | Move up
list:down           | Down               | Down              | Move down
list:delete         | -                  | -                 | Delete a note(This event will called by `core:delete` event)

## Editor

Command                 | macOS Key          | Windows/Linux Key | Description
------------------------|--------------------|-------------------|-------------
editor:focus-editor     | Esc                | Esc               | Focus List
editor:focus-tag-select | Cmd + '            | Ctrl + '          | Focus Tag Select
editor:find             | Cmd + f            | Ctrl + f          | Find in note
