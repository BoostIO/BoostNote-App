# Redux Store

## Reducers

`config`, `status`, `storageMap`, `routing`

### `config`

User Preferences. Check [Config](config.md)

### `status`

Almost same with `config` but temporary like width of Resizable component.

### `storageMap`

Core part of data.

```
storageMap: OrderedMap <storageName, V>
  |- storageData: Map
      |- notes: Map <noteId, V>
          |- noteId: Map
      |- folders: Map <folderName, V>
          |- folderName: Map
            |- notes: Set // map for fast indexing by folder
```

### `routing`

Reducer of `react-router-redux`.
