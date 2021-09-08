import { Block } from '../../api/blocks'
import { blockEventEmitter } from '../utils/events'
import { sleep } from '../utils/sleep'

export function getBlockDomId(block: Block) {
  return `${block.id}--block-${block.type}`
}

export async function domBlockCreationHandler(
  scrollToElement: (elem: HTMLElement | null) => void,
  createdBlock: Block
) {
  await sleep(100) //rendering delay
  const blockElem = document.getElementById(getBlockDomId(createdBlock))
  scrollToElement(blockElem)
  blockEventEmitter.dispatch({
    blockId: createdBlock.id,
    blockType: createdBlock.type,
    event: 'creation',
  })
}
