const crypto = require('crypto')
const _ = require('lodash')

const defaultLength = 10

export function randomBytes (length = defaultLength) {
  if (!_.isFinite(length)) length = defaultLength
  return crypto.randomBytes(length).toString('hex')
}

const util = {
  randomBytes
}

export default util

module.exports = util
