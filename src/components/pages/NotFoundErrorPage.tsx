import Application from '../Application'
import { mdiAlertBoxOutline } from '@mdi/js'
import React from 'react'
import EmojiIcon from '../../cloud/components/atoms/EmojiIcon'
import { useRouter } from '../../lib/router'
import Button from '../../shared/components/atoms/Button'
import { usePreferences } from '../../lib/preferences'

const NotFoundErrorPage = ({}) => {
  const { push } = useRouter()
  const { preferences } = usePreferences()
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
            <span style={{ marginRight: 10 }}>Page Not Found</span>
          </>
        ),
      }}
    >
      <div style={{ marginLeft: 15 }}>
        <p>Choose other space or create a new one</p>
        <Button
          onClick={() => {
            if (preferences['cloud.user'] == null) {
              push('/app/boosthub/login')
            } else {
              push('/app/boosthub/teams')
            }
          }}
        >
          Create Space
        </Button>
      </div>
    </Application>
  )
}

export default NotFoundErrorPage
