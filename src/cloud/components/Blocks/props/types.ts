import { Block } from '../../../api/blocks'

export interface BlockPropertyProps {
  value: string
  onUpdate: (val: string) => Promise<void> | void
}

export interface BlockDataProps<T extends Block> {
  data: T['data']
  onUpdate: (data: T['data']) => Promise<void>
}
