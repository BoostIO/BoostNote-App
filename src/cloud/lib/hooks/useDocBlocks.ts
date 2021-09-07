import { useBlocks } from '../stores/blocks'
import { useEffect, useState, useMemo } from 'react'
import {
  Block,
  BlockCreateRequestBody,
  BlockUpdateRequestBody,
} from '../../api/blocks'
import {
  CreateBlockApiOptions,
  DeleteBlockApiOptions,
  UpdateBlockApiOptions,
  useBlocksApi,
} from './useBlocksApi'
import { BulkApiActionRes } from '../../../design/lib/hooks/useBulkApi'

type BlockState = { type: 'loading' } | { type: 'loaded'; block: Block }

export type BlockActionCreate = (
  block: BlockCreateRequestBody,
  parent: Block,
  options?: CreateBlockApiOptions
) => Promise<BulkApiActionRes>

export type BlockActionUpdate = (
  block: BlockUpdateRequestBody,
  options?: UpdateBlockApiOptions
) => Promise<BulkApiActionRes>

export type BlockActionRemove = (
  block: Block,
  options?: DeleteBlockApiOptions
) => Promise<BulkApiActionRes>

export interface BlockActions {
  create: BlockActionCreate
  update: BlockActionUpdate
  remove: BlockActionRemove
}

export function useDocBlocks(id: string) {
  const { observeDocBlocks } = useBlocks()
  const { createBlock, updateBlock, deleteBlock, sendingMap } = useBlocksApi()
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
      create: (block, parent, options) =>
        createBlock(block, parent, options || {}, id),
      update: (block, options) => updateBlock(block, options || {}, id),
      remove: (block, options) => deleteBlock(block, options || {}, id),
    }
  }, [id, createBlock, updateBlock, deleteBlock])

  return {
    state,
    actions,
    sendingMap,
  }
}
