import { compareDateString } from '../../../design/lib/date'
import { Block } from '../../api/blocks'

export function orderBlockChildren({ children, ...rest }: Block): Block {
  return {
    ...rest,
    children:
      children != null
        ? children
            .sort((a, b) => {
              return compareDateString(a.createdAt, b.createdAt, 'DESC')
            })
            .map((block) => orderBlockChildren(block))
        : [],
  } as Block
}
