import { mdiTextBoxPlusOutline } from '@mdi/js'
import React from 'react'
import { useLocalUI } from '../../lib/v2/hooks/local/useLocalUI'
import { NoteStorage } from '../../lib/db/types'
import ButtonGroup from '../../shared/components/atoms/ButtonGroup'
import Button from '../../shared/components/atoms/Button'
import styled from '../../shared/lib/styled'

const NewDocButton = ({ workspace }: { workspace: NoteStorage }) => {
  const { openNewDocForm } = useLocalUI()
  // todo: [komediruzecki-30/05/2021] Implement Template modal and Templates
  return (
    <Container>
      <ButtonGroup>
        <Button
          variant='primary'
          size='sm'
          iconPath={mdiTextBoxPlusOutline}
          id='sidebar-newdoc-btn'
          iconSize={16}
          onClick={() =>
            openNewDocForm({
              parentFolderPathname: '/',
              workspaceId: workspace.id,
            })
          }
        >
          Create new doc
        </Button>
      </ButtonGroup>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  .button__group {
    flex: 1 1 auto;
  }

  #sidebar-newdoc-btn {
    flex: 1 1 auto;
  }

  .sidebar-newdoc-controls {
    flex: 0 0 auto;
  }
`

export default NewDocButton
