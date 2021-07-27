import { callApi } from '../../lib/client'

export interface Block<T extends string, D> {
  type: T
  id: string
  name: string
  children: Block<any, any>[]
  data: D
  doc: string
}

export async function getDocBlocks(docId: string): Promise<Block<any, any>[]> {
  const { blocks } = await callApi(`api/blocks`, {
    search: { tree: true, doc: docId },
  })

  return blocks
}

export async function createBlock(
  body: Omit<Block<any, any>, 'id'>,
  parent?: string
): Promise<Block<any, any>> {
  const { block } = await callApi(`api/blocks`, {
    method: 'post',
    json: { ...body, parent },
  })

  return block
}

export async function updateBlock(
  body: Block<any, any>
): Promise<Block<any, any>> {
  const { block } = await callApi(`api/blocks/${body.id}`, {
    method: 'put',
    json: body,
  })

  return block
}

export async function deleteBlock(id: string) {
  await callApi(`api/blocks/${id}`, { method: 'delete' })
}
