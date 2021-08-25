import React from 'react'
import { ContainerBlock } from '../../api/blocks'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import ApplicationPage from '../ApplicationPage'
import BlockContent from './BlockContent'

interface BlockEditorProps {
  doc: SerializedDocWithBookmark & { rootBlock: ContainerBlock }
}

const BlockEditor = ({ doc }: BlockEditorProps) => {
  return (
    <ApplicationPage>
      <BlockContent doc={doc} />
    </ApplicationPage>
  )
}

export default BlockEditor
