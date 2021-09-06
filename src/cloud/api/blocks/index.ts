import { callApi } from '../../lib/client'

interface BlockType<T, D, C extends BlockType<any, any, any> = never> {
  type: T
  id: string
  name: string
  children: C[]
  data: D
  createdAt: string
}

export type MarkdownBlock = BlockType<'markdown', null>
export type EmbedBlock = BlockType<'embed', { url: string }>
export type GithubIssueBlock = BlockType<
  'github.issue',
  any,
  MarkdownBlock | EmbedBlock | TableBlock | ContainerBlock
>
export type TableBlock = BlockType<
  'table',
  { columns: Record<string, string> },
  GithubIssueBlock
>
export type ContainerBlock = BlockType<
  'container',
  null,
  MarkdownBlock | EmbedBlock | TableBlock | ContainerBlock
>

export type Block =
  | MarkdownBlock
  | EmbedBlock
  | TableBlock
  | ContainerBlock
  | GithubIssueBlock

export async function getBlockTree(rootBlock: string): Promise<Block> {
  const { block } = await callApi(`api/blocks/${rootBlock}`, {
    search: { tree: true },
  })

  return block
}

export type BlockCreateRequestBody = Omit<Block, 'id' | 'createdAt'>
export async function createBlock(
  body: BlockCreateRequestBody,
  parent: string
): Promise<Block> {
  const { block } = await callApi(`api/blocks`, {
    method: 'post',
    json: { ...body, parent },
  })

  return block
}

export type BlockUpdateRequestBody = { id: string; type: string } & Partial<
  Block
>
export async function updateBlock(
  body: BlockUpdateRequestBody
): Promise<Block> {
  const { block } = await callApi(`api/blocks/${body.id}`, {
    method: 'put',
    json: body,
  })

  return block
}

export async function deleteBlock(id: string) {
  await callApi(`api/blocks/${id}`, { method: 'delete' })
}
