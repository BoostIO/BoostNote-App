import { Block } from '../../api/blocks'
import {
  markdownBlockEventEmitter,
  tableBlockEventEmitter,
} from '../utils/events'
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
  if (createdBlock.type === 'table') {
    tableBlockEventEmitter.dispatch({
      type: 'focus-title',
      id: createdBlock.id,
    })
  } else if (createdBlock.type === 'markdown') {
    markdownBlockEventEmitter.dispatch({
      type: 'edit',
      id: createdBlock.id,
    })
  }
}
