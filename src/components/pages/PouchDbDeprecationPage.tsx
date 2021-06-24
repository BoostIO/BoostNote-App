import React from 'react'
import Application from '../Application'
import Form from '../../shared/components/molecules/Form'
import { usePreferences } from '../../lib/preferences'

const PouchDbDeprecationPage = () => {
  const { openTab } = usePreferences()
  return (
    <Application
      hideSidebar={true}
      content={{
        reduced: true,
        header: (
          <>
            <span style={{ marginRight: 10 }}>
              The local storage and legacy cloud storage are no longer
              supported.
            </span>
          </>
        ),
      }}
    >
      <Form
        fullWidth={false}
        rows={[
          {
            title: 'Select desired migration option.',
            items: [
              {
                type: 'button',
                props: {
                  label: 'Convert to File System based Local Space',
                  onClick: () => openTab('storage'),
                },
              },
            ],
          },
          {
            items: [
              {
                type: 'button',
                props: {
                  label: 'Migrate to new Cloud Space',
                  onClick: () => openTab('migration'),
                },
              },
            ],
          },
          {
            title:
              'You can also export the storage by selecting an app navigator tree, clicking on the context menu of folder item and selecting "Export Folder".',
            description:
              'Follow further export options and instructions to export all of your notes in desired format. Modify export options in Preferences | Export Settings tab.',
          },
        ]}
      />
    </Application>
  )
}

export default PouchDbDeprecationPage
