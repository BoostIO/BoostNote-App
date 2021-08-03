import React from 'react'
import { FSNoteStorage } from '../../lib/db/types'
import Application from '../Application'
import Button from '../../shared/components/atoms/Button'
import styled from '../../shared/lib/styled'
import FormInput from '../../shared/components/molecules/Form/atoms/FormInput'
import { openNew } from '../../lib/platform'
import { usePreferences } from '../../lib/preferences'

interface FSDbDeprecationPageProps {
  storage: FSNoteStorage
}

const FSDbDeprecationPage = ({ storage }: FSDbDeprecationPageProps) => {
  const { openTab } = usePreferences()

  return (
    <Application content={{}}>
      <Container>
        <h1>Local space feature has been deprecated.</h1>
        <p>
          Since, we have released the standalone local space app, we have
          decided to discard this from the app. The stand alone app is using
          same code base but lighter since it does not have any cloud features
          and usage tracking.
        </p>

        <p>To continue using the local space, you have two options.</p>

        <ul>
          <li>
            <p>Migrate data to cloud space.</p>
            <Button
              onClick={() => {
                openTab('migration')
              }}
            >
              Migrate to cloud space
            </Button>
          </li>
          <li>
            <p>
              Use data from the stand alone app. Check the below description.
            </p>
          </li>
        </ul>

        <h2>How to use the standalone app</h2>

        <p>You have two options to continue using this local space.</p>

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
            <Button variant='danger'>Remove</Button>
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
`
