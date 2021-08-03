import React, { useCallback } from 'react'
import { Block } from '../../api/blocks'
import { SerializedDoc } from '../../interfaces/db/doc'
import { useDocBlocks } from '../../lib/hooks/useDocBlocks'

const BlockContent = (doc: SerializedDoc) => {
  const { state, actions } = useDocBlocks(doc.id)

  const createContainer = useCallback(async () => {
    if (doc.rootBlock != null) {
      await actions.create(
        {
          name: 'container',
          type: 'container',
          children: [],
          data: null,
        },
        doc.rootBlock
      )
    }
  }, [doc, actions])

  if (state.type === 'loading') {
    return <div>loading</div>
  }

  return (
    <div>
      <div>
        <BlockTree blocks={state.blocks} />
        <div>
          <div>New Items</div>
          <div onClick={createContainer}>Container</div>
          <div>Table</div>
          <div>Embed</div>
        </div>
      </div>
      <div>
        <BlockView blocks={state.blocks} />
        <div>Add Block</div>
      </div>
    </div>
  )
}

interface BlockTreeProps {
  blocks: Block<any, any>[]
}

const BlockTree = ({ blocks }: BlockTreeProps) => {
  return (
    <div>
      {blocks.map((block) => {
        return (
          <div key={block.id}>
            <div>{capitalize(block.type)}</div>
            {block.children.length > 0 && <BlockTree blocks={block.children} />}
          </div>
        )
      })}
    </div>
  )
}

interface BlockViewProps {
  blocks: Block<any, any>[]
}

const BlockView = ({ blocks }: BlockViewProps) => {
  return <pre>{JSON.stringify(blocks)}</pre>
}

export default BlockContent
