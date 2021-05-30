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
            <h3 style={{ marginRight: 10 }}>
              The local storage and legacy cloud storage are no longer
              supported.
            </h3>
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
                  label: 'Convert to File System Workspace',
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
        ]}
      />
    </Application>
  )
}

export default PouchDbDeprecationPage
