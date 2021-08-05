import React from 'react'
import { FSNoteStorage } from '../../lib/db/types'
import Application from '../Application'
import Button from '../../shared/components/atoms/Button'
import styled from '../../shared/lib/styled'
import FormInput from '../../shared/components/molecules/Form/atoms/FormInput'
import { openNew } from '../../lib/platform'
import { usePreferences } from '../../lib/preferences'
import { useLocalUI } from '../../lib/v2/hooks/local/useLocalUI'

interface FSDbDeprecationPageProps {
  storage: FSNoteStorage
}

const FSDbDeprecationPage = ({ storage }: FSDbDeprecationPageProps) => {
  const { openTab } = usePreferences()
  const { removeWorkspace } = useLocalUI()

  return (
    <Application content={{}}>
      <Container>
        <h1>Local space feature has been deprecated.</h1>

        <p>
          We have decided to separate the local space feature from this app
          because we have found that the goal of the local space feature is
          different than the one of the cloud space feature.
        </p>

        <p>
          The deprecation will not delete any data. But, to continue accessing
          the data, You need to follow one of these options below.
        </p>

        <h2>Option 1 : Migrate the data to cloud space</h2>

        <p>
          The cloud space is the best option if you want to use the data with
          your team and to access it from multiple devices. You can start it
          from free plan with your team. (Revision control, Access control and
          size of attachments are limited for free plan)
        </p>

        <p>
          This option will migrate your documents in this local space to the
          cloud space but will not delete your local space data from your
          machine.
        </p>

        <p>
          <Button
            onClick={() => {
              openTab('migration')
            }}
          >
            Migrate to cloud space
          </Button>
        </p>

        <h2>Option 2 : Use the standalone app</h2>

        <p>
          If you want to keep your data more securely in your local device, the
          standalone app should fit to you. It is technically using the same
          code base of the deprecated local space but without any cloud modules.
        </p>

        <ol>
          <li>
            <p>Download BoostNote.next-local app.</p>
            <Button
              onClick={() => {
                openNew(
                  'https://github.com/boostio/boostnote.next-local/releases/latest'
                )
              }}
            >
              Download BoostNote.next-local
            </Button>
          </li>
          <li>
            <p>Add a space from the downloaded app with the pathname below.</p>
            <FormInput
              className='pathname'
              defaultValue={storage.db.location}
              readOnly
            />
          </li>
          <li>
            <p>
              Remove this space from this app. (This action will not delete
              actual data of the local space.)
            </p>
            <Button
              variant='danger'
              onClick={() => {
                removeWorkspace(storage)
              }}
            >
              Remove space
            </Button>
          </li>
        </ol>
      </Container>
    </Application>
  )
}

export default FSDbDeprecationPage

const Container = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  max-width: 700px;

  .pathname {
    width: 100%;
  }

  ul,
  ol {
    padding-inline-start: 2em;
  }

  p {
    line-height: 1.6;
  }
`
