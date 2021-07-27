import { createStoreContext } from '../../utils/context'
import { useToast } from '../../../../shared/lib/stores/toast'
import { useRef, useCallback } from 'react'
import {
  Block,
  getDocBlocks,
  deleteBlock,
  updateBlock,
  createBlock,
} from '../../../api/blocks'

type BlocksObserver = (blocks: Block<any, any>[]) => void

function useBlocksStore() {
  const { pushApiErrorMessage } = useToast()
  const blocksCache = useRef<Map<string, Block<any, any>[]>>(new Map())
  const docBlockObservers = useRef<Map<string, Set<BlocksObserver>>>(new Map())

  const getBlocks = useCallback(
    async (doc: string) => {
      try {
        const blocks = await getDocBlocks(doc)
        blocksCache.current.set(doc, blocks)
        const observers = docBlockObservers.current.get(doc) || new Set()
        for (const observer of observers) {
          observer(blocks)
        }
        return true
      } catch (err) {
        pushApiErrorMessage(err)
        return false
      }
    },
    [pushApiErrorMessage]
  )

  const observeDocBlocks = useCallback(
    (doc: string, observer: BlocksObserver) => {
      const observers = docBlockObservers.current.get(doc) || new Set()
      observers.add(observer)
      docBlockObservers.current.set(doc, observers)
      Promise.resolve(() => {
        if (blocksCache.current.has(doc)) {
          observer(blocksCache.current.get(doc)!)
        }
      })
      getBlocks(doc)
      return () => {
        observers.delete(observer)
      }
    },
    [getBlocks]
  )

  const create: typeof createBlock = useCallback(
    async (body, parent) => {
      const block = await createBlock(body, parent)
      await getBlocks(block.doc)
      return block
    },
    [getBlocks]
  )

  const remove = useCallback(
    async (block: Block<any, any>) => {
      await deleteBlock(block.id)
      await getBlocks(block.doc)
    },
    [getBlocks]
  )

  const update: typeof updateBlock = useCallback(
    async (block) => {
      const updated = await updateBlock(block)
      await getBlocks(updated.doc)
      return updated
    },
    [getBlocks]
  )

  return {
    observeDocBlocks,
    create,
    remove,
    update,
  }
}

export const {
  StoreProvider: BlocksProvider,
  useStore: useBlocks,
} = createStoreContext(useBlocksStore, 'comments')
