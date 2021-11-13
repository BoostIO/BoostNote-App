import path from 'path'
import url from 'url'
import { app } from 'electron'

export const dev = process.env.NODE_ENV !== 'production'

export const electronFrontendUrl = dev
  ? 'http://localhost:3000/app'
  : url.format({
      pathname: path.join(app.getAppPath(), './compiled/index.html'),
      protocol: 'file',
      slashes: true,
    })
