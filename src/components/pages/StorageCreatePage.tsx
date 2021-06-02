import React from 'react'
import FSStorageCreateForm from '../organisms/FSStorageCreateForm'
import { mdiBookPlusMultiple } from '@mdi/js'
import Application from '../Application'
import EmojiIcon from '../../cloud/components/atoms/EmojiIcon'

const StorageCreatePage = () => {
  return (
    <Application
      hideSidebar={true}
      content={{
        reduced: true,
        header: (
          <>
            <EmojiIcon
              defaultIcon={mdiBookPlusMultiple}
              style={{ marginRight: 10 }}
              size={16}
            />
            <span style={{ marginRight: 10 }}>Create Local Workspace</span>
          </>
        ),
      }}
    >
      <FSStorageCreateForm />
    </Application>
  )
}

export default StorageCreatePage
