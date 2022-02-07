import { lngKeys } from '../../lib/i18n/types'
import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { useI18n } from '../../lib/hooks/useI18n'
import {
  MenuItem,
  MenuTypes,
  useContextMenu,
} from '../../../design/lib/stores/contextMenu'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import EditableInput from '../../../design/components/atoms/EditableInput'

interface ItemProps {
  doc: SerializedDocWithSupplemental
  children?: React.ReactNode
}

const EditableDocItemContainer = ({ doc, children }: ItemProps) => {
  const [editingItemTitle, setEditingItemTitle] = useState<boolean>(false)
  const [showingContextMenuActions, setShowingContextMenuActions] =
    useState<boolean>(false)

  const { updateDoc, deleteDocApi, sendingMap } = useCloudApi()
  const { translate } = useI18n()
  const { popup } = useContextMenu()

  const updateDocTitle = useCallback(
    async (doc, newTitle) => {
      await updateDoc(doc, {
        workspaceId: doc.workspaceId,
        parentFolderId: doc.parentFolderId,
        title: newTitle,
      })
      setEditingItemTitle(false)
    },
    [updateDoc]
  )

  const openActionMenu: (
    event: React.MouseEvent<HTMLDivElement>,
    doc: SerializedDocWithSupplemental
  ) => void = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement>,
      doc: SerializedDocWithSupplemental
    ) => {
      const editTitleAction: MenuItem = {
        icon: <Icon path={mdiPencilOutline} />,
        type: MenuTypes.Normal,
        label: translate(lngKeys.GeneralEditTitle),
        onClick: () => setEditingItemTitle(true),
      }
      const deleteDocAction: MenuItem = {
        icon: <Icon path={mdiTrashCanOutline} />,
        type: MenuTypes.Normal,
        label: translate(lngKeys.GeneralDelete),
        onClick: () => deleteDocApi({ id: doc.id, teamId: doc.teamId }),
      }
      const actions: MenuItem[] = [editTitleAction, deleteDocAction]

      event.preventDefault()
      event.stopPropagation()
      popup(event, actions)
    },
    [deleteDocApi, popup, translate]
  )

  const showInput = !sendingMap.has(doc.id) && editingItemTitle
  return (
    <ItemContainer
      onMouseEnter={() => setShowingContextMenuActions(true)}
      onMouseLeave={() => setShowingContextMenuActions(false)}
    >
      {showInput && (
        <EditableInput
          editOnStart={true}
          placeholder={'Title...'}
          text={doc.title}
          onTextChange={(newText) => updateDocTitle(doc, newText)}
          onBlur={() => setEditingItemTitle(false)}
        />
      )}

      {!showInput && <>{children}</>}

      {showingContextMenuActions && (
        <div className={'item__container__item__actions'}>
          <div
            onClick={(event) => openActionMenu(event, doc)}
            className='doc__action'
          >
            <Icon size={20} path={mdiDotsVertical} />
          </div>
        </div>
      )}
    </ItemContainer>
  )
}

const ItemContainer = styled.div`
  position: relative;

  .item__container__item__actions {
    position: absolute;
    right: 5px;
    z-index: 1;
    margin: 0;
    top: 50%;
    transform: translate(-50%, -50%);

    .doc__action {
      width: 20px;
      height: 20px;
    }
  }
`

export default EditableDocItemContainer
