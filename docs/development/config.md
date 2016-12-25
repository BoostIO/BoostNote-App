# Config

Config is stored in

- `%APPDATA%/Inpad/config.json` on Windows
- `$XDG_CONFIG_HOME/Inpad/config.json` or `~/.config` on Linux
- `~/Library/Application Support/Inpad/config.json` on macOS

## Default Config

> It can be found `src/lib/consts.js`

```js
{
  // default, dark
  theme: 'default',

  editorFontSize: 14,
  editorFontFamily: 'Consolas, "Liberation Mono", Menlo, Courier',
  editorTheme: 'default',
  // space, tab
  editorIndentStyle: 'space',
  editorIndentSize: 2,

  previewFontSize: 14,
  previewFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial',
  previewCodeBlockTheme: 'default',
  previewCodeBlockFontFamily: 'Consolas, "Liberation Mono", Menlo, Courier'
}
```
