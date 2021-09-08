import { createStoreContext } from '../../utils/context'
import { useRef, useCallback, useEffect } from 'react'
import { Block, getBlockTree } from '../../../api/blocks'
import { useToast } from '../../../../design/lib/stores/toast'
import { SerializedAppEvent } from '../../../interfaces/db/appEvents'

type BlocksObserver = (blocks: Block) => void

function useBlocksStore() {
  const { pushApiErrorMessage } = useToast()
  const treeCache = useRef<Map<string, Block>>(new Map())
  const treeObservers = useRef<Map<string, Set<BlocksObserver>>>(new Map())

  const getBlocks = useCallback(
    async (rootBlock: string, suppressError = false) => {
      try {
        const blocks = await getBlockTree(rootBlock)
        treeCache.current.set(rootBlock, blocks)
        const observers = treeObservers.current.get(rootBlock) || new Set()
        for (const observer of observers) {
          observer(blocks)
        }
        return true
      } catch (err) {
        if (!suppressError) {
          pushApiErrorMessage(err)
        }
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

  const getBlocksRef = useRef(getBlocks)
  useEffect(() => {
    getBlocksRef.current = getBlocks
  }, [getBlocks])
  const blockEventListener = useCallback(async (event: SerializedAppEvent) => {
    switch (event.type) {
      case 'blockCreated':
      case 'blockUpdated':
      case 'blockDeleted': {
        if (typeof event.data.rootBlockId === 'string') {
          getBlocksRef.current(event.data.rootBlockId, true)
        }
      }
    }
  }, [])

  return {
    observeDocBlocks,
    getBlocks,
    blockEventListener,
  }
}

export const {
  StoreProvider: BlocksProvider,
  useStore: useBlocks,
} = createStoreContext(useBlocksStore, 'blocks')
