import { capitalize } from 'lodash'
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

export function blockTitle(block: Block) {
  switch (block.type) {
    case 'github.issue':
      return block.data?.title || 'Github Issue'
    case 'embed':
    case 'table':
    case 'container':
      return block.name.trim() === '' ? capitalize(block.type) : block.name
    default:
      return capitalize(block.type)
  }
}
