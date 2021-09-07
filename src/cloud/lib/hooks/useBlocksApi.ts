import { useCallback } from 'react'
import shortid from 'shortid'
import useBulkApi from '../../../design/lib/hooks/useBulkApi'
import {
  Block,
  BlockCreateRequestBody,
  BlockUpdateRequestBody,
  createBlock,
  deleteBlock,
  updateBlock,
} from '../../api/blocks'
import { useBlocks } from '../stores/blocks'

export interface CreateBlockApiOptions {
  afterSuccess?: (block: Block) => void
}
export interface UpdateBlockApiOptions {
  afterSuccess?: (block: Block) => void
}

export interface DeleteBlockApiOptions {
  afterSuccess?: () => void
}

export function useBlocksApi() {
  const { sendingMap, send } = useBulkApi()
  const { getBlocks } = useBlocks()

  const createBlockApi = useCallback(
    async (
      body: BlockCreateRequestBody,
      parent: Block,
      options: CreateBlockApiOptions,
      root: string
    ) => {
      return send(shortid.generate(), 'create-block', {
        api: () => createBlock(body, parent.id),
        cb: async (block: Block) => {
          await getBlocks(root)
          if (options.afterSuccess != null) {
            options.afterSuccess(block)
          }
        },
      })
    },
    [getBlocks, send]
  )

  const deleteBlockApi = useCallback(
    async (
      block: Block,
      options: {
        afterSuccess?: () => void
      },
      root: string
    ) => {
      return send(block.id, 'delete-block', {
        api: () => deleteBlock(block.id),
        cb: async () => {
          await getBlocks(root)
          if (options.afterSuccess != null) {
            options.afterSuccess()
          }
        },
      })
    },
    [getBlocks, send]
  )

  const updateBlockApi = useCallback(
    async (
      block: BlockUpdateRequestBody,
      options: UpdateBlockApiOptions,
      root: string
    ) => {
      const res = await send(block.id, 'update-block', {
        api: () => updateBlock(block),
        cb: async (block: Block) => {
          await getBlocks(root)
          if (options.afterSuccess != null) {
            options.afterSuccess(block)
          }
        },
      })
      return res
    },
    [getBlocks, send]
  )

  return {
    send,
    sendingMap,
    createBlock: createBlockApi,
    deleteBlock: deleteBlockApi,
    updateBlock: updateBlockApi,
  }
}
