import { Block } from '../../../api/blocks'

export interface BlockDataProps<T extends Block> {
  data: T['data']
  onUpdate: (data: T['data']) => Promise<void>
}
