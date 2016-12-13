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

Name             | Payload       | Action
-----------------|---------------|------------------------
new-note         |               | Dispatch `title:new-note` event to window
new-folder       |               | Dispatch `nav:new-folder` event to window
delete           |               | Dispatch `nav:delete` and `detail:delete` event to window
focus-search     |               | Dispatch `title:focus-search` event to window
find             |               | Dispatch `detail:find` event to window
print            |               | Dispatch `detail:print` event to window
open-preferences |               | Dispatch `title:open-preferences` event to window
update-config | Config Object | Apply the updated config

### Preferences

Name      | Payload       | Action
----------|---------------|------------------------
open      |               | Open Preferences window
