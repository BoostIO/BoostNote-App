/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const electron_notarize = require('electron-notarize')

module.exports = async function (params) {
  if (process.platform !== 'darwin') {
    return
  }

  const appId = 'com.boostio.boostnote'

  const appPath = path.join(
    params.appOutDir,
    `${params.packager.appInfo.productFilename}.app`
  )
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`)
  }

  console.log(`Notarizing ${appId} found at ${appPath}`)

  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    })
  } catch (error) {
    console.error(error)
  }

  console.log(`Done notarizing ${appId}`)
}
