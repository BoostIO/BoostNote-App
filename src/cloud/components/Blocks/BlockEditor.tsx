import React from 'react'
import Application from '../../Application'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import BlockContent from './BlockContent'
import { Block } from '../../../api/blocks'

interface BlockEditorProps {
  doc: SerializedDocWithBookmark & { rootBlock: Block<any, any> }
}

const BlockEditor = ({ doc }: BlockEditorProps) => {
  return (
    <Application content={{}}>
      <BlockContent doc={doc} />
    </Application>
  )
}

export default BlockEditor
