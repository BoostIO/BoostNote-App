import {
  mdiDotsHorizontal,
  mdiPencilBoxMultipleOutline,
  mdiTextBoxPlusOutline,
} from '@mdi/js'
import React from 'react'
import Button from '../../../shared/components/atoms/Button'
import ButtonGroup from '../../../shared/components/atoms/ButtonGroup'
import {
  MenuTypes,
  useContextMenu,
} from '../../../shared/lib/stores/contextMenu'
import { useModal } from '../../../shared/lib/stores/modal'
import styled from '../../../shared/lib/styled'
import { SerializedTeam } from '../../interfaces/db/team'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useNav } from '../../lib/stores/nav'
import TemplatesModal from '../organisms/Modal/contents/TemplatesModal'

const NewDocButton = ({ team }: { team: SerializedTeam }) => {
  const {
    currentWorkspaceId,
    workspacesMap,
    currentPath,
    currentParentFolderId,
  } = useNav()
  const { openNewDocForm } = useCloudResourceModals()
  const { popup } = useContextMenu()
  const { openModal } = useModal()

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
            openNewDocForm(
              {
                team,
                parentFolderId: currentParentFolderId,
                workspaceId: currentWorkspaceId,
              },
              {
                precedingRows: [
                  {
                    description: `${
                      workspacesMap.get(currentWorkspaceId || '')?.name
                    }${currentPath}`,
                  },
                ],
              }
            )
          }
        >
          Create new doc
        </Button>
        <Button
          variant='primary'
          size='sm'
          className='sidebar-newdoc-controls'
          iconPath={mdiDotsHorizontal}
          onClick={(event) => {
            event.preventDefault()
            popup(event, [
              {
                icon: mdiPencilBoxMultipleOutline,
                type: MenuTypes.Normal,
                label: 'Use a template',
                onClick: () =>
                  openModal(<TemplatesModal />, { width: 'large' }),
              },
            ])
          }}
        />
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
