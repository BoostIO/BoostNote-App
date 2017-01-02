const crypto = require('crypto')
const _ = require('lodash')

const defaultLength = 10

/**
 * Generate random hash for id of a new note
 * It doesn't ensure unique. You should check it by yourself.
 *
 * @param {Number} Length of hash
 * @returns {String} Random hash
 */
export function randomBytes (length = defaultLength) {
  if (!_.isFinite(length)) length = defaultLength
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Check if the target element is really blurred
 * By iterating parents of the relatedTarget, check the target element is still focused.
 *
 * @param {FocusEvent} blur event
 * @param {HTMLElement} target element
 * @returns {Boolean} Checked result
 */
export function isFinallyBlurred (event, target) {
  let el = event.relatedTarget
  while (el != null) {
    if (el === target) {
      return false
    }
    el = el.parentNode
  }
  return true
}

const util = {
  randomBytes,
  isFinallyBlurred
}

export default util
