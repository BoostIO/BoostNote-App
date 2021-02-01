import { randomBytes } from 'crypto'

export const generateSecret = () => randomBytes(32).toString('hex')
