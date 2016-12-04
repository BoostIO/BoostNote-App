# Database

Inpad uses pouchDB as a storage and the pouchDB uses WebSQL as a default.

## Default Storage

By default, Inpad provides a storage, named `Notebook`
The storage can not be deleted and renamed. User only can reset the data of it.

If it deleted from out of the app, the app will try to create it again.

## Default Folder

Each storage has a default folder, named `Notes`.
It also can not be deleted and renamed.

If it deleted from out of the app, the app will try to create it again.

## `_id` conventions

Database of pouchDB doesn't have a concept of table. It is just a key-value documents store.
So, we have to put **Notes** and **Folders** into same space.

Inpad will set prefix for each type of data.

type|conventions
---|---
Note|`note:$RANDOM_HASH$`
Folder|`folder:$PATH_OF_FOLDER$`
Tag|`tag:$TAG$`

### `$RANDOM_HASH$`

This is a string of 10 Random bytes. It can be issued easily by `main/lib/util.randomBytes`.

> the returned hash is not unique. You should check if it is duplicated before creating a new note.

### `$PATH_OF_FOLDERS$`

This string should be a valid path. When creating a folder, the app will convert it into a valid path if it is invalid.

### `$TAG$`

Tag is a lowcased alphanumeric string.