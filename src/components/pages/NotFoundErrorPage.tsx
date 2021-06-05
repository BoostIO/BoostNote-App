import Application from '../Application'
import { mdiAlertBoxOutline } from '@mdi/js'
import React from 'react'
import EmojiIcon from '../../cloud/components/atoms/EmojiIcon'

interface NoteFoundErrorPageProps {
  title: string
  description: string
}

const NoteFoundErrorPage = ({
  title,
  description,
}: NoteFoundErrorPageProps) => {
  return (
    <Application
      hideSidebar={true}
      content={{
        header: (
          <>
            <EmojiIcon
              defaultIcon={mdiAlertBoxOutline}
              style={{ marginRight: 10, marginLeft: 15 }}
              size={24}
            />
            <span style={{ marginRight: 10 }}>{title}</span>
          </>
        ),
      }}
    >
      <div style={{ marginLeft: 15 }}>{description}</div>
    </Application>
  )
}

export default NoteFoundErrorPage
