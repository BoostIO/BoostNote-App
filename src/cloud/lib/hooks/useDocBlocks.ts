import { useBlocks } from '../stores/blocks'
import { useEffect, useState, useMemo } from 'react'
import { Block } from '../../api/blocks'

type BlockState = { type: 'loading' } | { type: 'loaded'; block: Block }

export interface BlockActions {
  create: (block: Omit<Block, 'id'>, parent: Block) => Promise<Block>
  update: (block: Block) => Promise<Block>
  remove: (block: Block) => Promise<void>
}

export function useDocBlocks(id: string) {
  const { observeDocBlocks, create, update, remove } = useBlocks()
  const [state, setState] = useState<BlockState>({ type: 'loading' })

  useEffect(() => {
    const unsub = observeDocBlocks(id, (block) => {
      setState({ type: 'loaded', block })
    })
    return () => {
      setState({ type: 'loading' })
      unsub()
    }
  }, [id, observeDocBlocks])

  const actions: BlockActions = useMemo(() => {
    return {
      create: (block, parent) => create(block, parent, id),
      update: (block) => update(block, id),
      remove: (block) => remove(block, id),
    }
  }, [id, create, update, remove])

  return {
    state,
    actions,
  }
}
