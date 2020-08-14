module.exports = {
  exportTrailingSlash: true,
  publicRuntimeConfig: {
    localeSubpaths:
      typeof process.env.LOCALE_SUBPATHS === 'string'
        ? process.env.LOCALE_SUBPATHS
        : 'none',
  },

  typescript: {
    ignoreDevErrors: true,
  },
}
