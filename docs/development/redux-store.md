# Redux Store

## Reducers

`config`, `status`, `storageMap`, `routing`

### `config`

User Preferences. Check [Config](./config.md)

### `status`

Almost same with `config` but temporary like width of Resizable component.

### `storageMap`

Core part of data.

```
storageMap: OrderedMap <storageName, V>
  |- storage: Map
      |- noteMap: Map <noteId, V>
          |- note: Map
      |- folderMap: Map <folderName, V>
          |- folder: Map
            |- notes: Set // map for fast indexing by folder
      |- tagMap: Map: Map <tagName, V>
          |- tag: Map
            |- notes: Set // map for fast indexing by folder
```

### `routing`

Reducer of `react-router-redux`.
