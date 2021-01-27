import { SerializedDoc } from './doc'

export interface SerializedShareLink {
  id: string
  password?: string
  expireAt?: string
  doc?: SerializedDoc
}
