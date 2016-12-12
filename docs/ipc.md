# IPC events

## Global

To get Main and Preferences window easily, they are bound to global.

```JS
// send ipc event to Main window
global.windows.main.webContents.send('Go')

// send ipc event to Preferences window
global.windows.preferences.webContents.send('Stop')
```

## Events

### Main

Name          | Payload       | Action
--------------|---------------|------------------------
new-note      |               | Fire `main:new-note` event to window
new-folder    |               | Fire `main:new-folder` event to window
delete        |               | Fire `main:delete` event to window
update-config | Config Object | Apply the updated config

### Preferences

Name      | Payload       | Action
----------|---------------|------------------------
open      |               | Open Preferences window
