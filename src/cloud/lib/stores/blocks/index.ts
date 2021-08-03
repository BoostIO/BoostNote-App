import { createStoreContext } from '../../utils/context'
import { useToast } from '../../../../shared/lib/stores/toast'
import { useRef, useCallback } from 'react'
import {
  Block,
  getBlockTree,
  deleteBlock,
  updateBlock,
  createBlock,
} from '../../../api/blocks'

type BlocksObserver = (blocks: Block) => void

function useBlocksStore() {
  const { pushApiErrorMessage } = useToast()
  const treeCache = useRef<Map<string, Block>>(new Map())
  const treeObservers = useRef<Map<string, Set<BlocksObserver>>>(new Map())

  const getBlocks = useCallback(
    async (rootBlock: string) => {
      try {
        const blocks = await getBlockTree(rootBlock)
        treeCache.current.set(rootBlock, blocks)
        const observers = treeObservers.current.get(rootBlock) || new Set()
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
    (rootBlock: string, observer: BlocksObserver) => {
      const observers = treeObservers.current.get(rootBlock) || new Set()
      observers.add(observer)
      treeObservers.current.set(rootBlock, observers)
      Promise.resolve(() => {
        if (treeCache.current.has(rootBlock)) {
          observer(treeCache.current.get(rootBlock)!)
        }
      })
      getBlocks(rootBlock)
      return () => {
        observers.delete(observer)
      }
    },
    [getBlocks]
  )

  const create = useCallback(
    async (body: Omit<Block, 'id'>, parent: Block, root: string) => {
      const block = await createBlock(body, parent.id)
      await getBlocks(root)
      return block
    },
    [getBlocks]
  )

  const remove = useCallback(
    async (block: Block, root: string) => {
      await deleteBlock(block.id)
      await getBlocks(root)
    },
    [getBlocks]
  )

  const update = useCallback(
    async (block: Block, root: string) => {
      const updated = await updateBlock(block)
      await getBlocks(root)
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
} = createStoreContext(useBlocksStore, 'blocks')
