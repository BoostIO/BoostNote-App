import { Block } from '../../api/blocks'

export function getBlockDomId(block: Block) {
  return `${block.id}--block-${block.type}`
}
