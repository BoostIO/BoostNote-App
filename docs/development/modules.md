# Modules

Inpad has a complicate module system because Electron does support both of environment Node.js and Browser.

For example, pouchdDB is targetted both environment.
If it is loaded via CommonJS2, it will use LevelDB by default.
Otherwise, it will use IndexedDB.

> We load PouchDB directly from its browser script and use `WebSQL` by default.

## Node.js modules

### How to load

- Add name of target module to `externals` array of webpack.config.js

## Modules

- Styled Components
- Sander
- Electron Devtools Installer
- Octicons
- Filenamify
- Color
- Moment
- Remark
- Remark Lint
- Remark Html
- Remark Emoji
- Remark Slug
- Strip Markdown
- Lodash
- Katex
- React Immutable Proptypes

## Browser modules(Accessing from global variables)

### How to load

- Add name of target module to last object in `externals` array of webpack.config.js.
- Add script to main.html and preferences.html.

### Modules

- React
- ReactDOM
- Redux
- Immutable
- Codemirror
- PouchDB

## Webpack modules

Some modules like React may support webpack.
You can just require them without modifying webpack.config.js.

But it should be installed to devDependencies to be excluded by `npm prune --production` when packaging the app.

> For faster compiling, We load React directly from its browser script instead of compiling via Webpack.
