import { createStoreContext } from '../../utils/context'
import { useRef, useCallback } from 'react'
import { Block, getBlockTree } from '../../../api/blocks'
import { useToast } from '../../../../design/lib/stores/toast'

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

  return {
    observeDocBlocks,
    getBlocks,
  }
}

export const {
  StoreProvider: BlocksProvider,
  useStore: useBlocks,
} = createStoreContext(useBlocksStore, 'blocks')
