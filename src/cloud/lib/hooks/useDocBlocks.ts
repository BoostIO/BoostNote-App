import { useBlocks } from '../stores/blocks'
import { useEffect, useState } from 'react'
import { Block } from '../../api/blocks'

type BlockState =
  | { type: 'loading' }
  | { type: 'loaded'; blocks: Block<any, any>[] }

export function useDocBlocks(id: string) {
  const { observeDocBlocks, ...actions } = useBlocks()
  const [state, setState] = useState<BlockState>({ type: 'loading' })

  useEffect(() => {
    return observeDocBlocks(id, (blocks) => {
      setState({ type: 'loaded', blocks })
    })
  }, [id, observeDocBlocks])

  return {
    state,
    actions,
  }
}
