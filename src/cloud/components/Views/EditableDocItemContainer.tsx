import { lngKeys } from '../../lib/i18n/types'
import {
  mdiContentDuplicate,
  mdiDotsHorizontal,
  mdiPencilOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
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
import { SerializedTeam } from '../../interfaces/db/team'
import { prepareDocPropsForAPI } from '../../lib/props'
import { GetDocResponseBody } from '../../api/teams/docs'
import { getDocContent } from '../../lib/utils/patterns'
import { BulkApiActionRes } from '../../../design/lib/hooks/useBulkApi'
import { usePage } from '../../lib/stores/pageStore'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useModal } from '../../../design/lib/stores/modal'

interface ItemProps {
  doc: SerializedDocWithSupplemental
  children?: React.ReactNode
}

const EditableDocItemContainer = ({ doc, children }: ItemProps) => {
  const [editingItemTitle, setEditingItemTitle] = useState<boolean>(false)
  const [showingContextMenuActions, setShowingContextMenuActions] =
    useState<boolean>(false)

  const { currentUserIsCoreMember } = usePage()
  const { createDoc, updateDoc, getUpdatedDocApi, sendingMap } = useCloudApi()
  const { deleteDoc } = useCloudResourceModals()
  const { translate } = useI18n()
  const { popup } = useContextMenu()
  const { closeAllModals } = useModal()

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

  const onDocDuplicate = useCallback(
    async (doc) => {
      const res: BulkApiActionRes<GetDocResponseBody> = await getUpdatedDocApi(
        doc
      )
      if (res.err) {
        return
      }

      const newProps = prepareDocPropsForAPI(doc.props)
      await createDoc(
        { id: doc.teamId } as SerializedTeam,
        {
          workspaceId: doc.workspaceId,
          parentFolderId: doc.parentFolderId,
          emoji: doc.emoji,
          title: doc.title,
          content: getDocContent(res.data.doc),
          props: newProps,
        },
        {
          skipRedirect: true,
        }
      )
    },
    [createDoc, getUpdatedDocApi]
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
        icon: <Icon size={16} path={mdiPencilOutline} />,
        type: MenuTypes.Normal,
        label: translate(lngKeys.GeneralEditTitle),
        onClick: () => setEditingItemTitle(true),
      }
      const duplicateAction: MenuItem = {
        icon: <Icon size={16} path={mdiContentDuplicate} />,
        type: MenuTypes.Normal,
        label: translate(lngKeys.GeneralDuplicate),
        onClick: () => onDocDuplicate(doc),
      }
      const deleteDocAction: MenuItem = {
        icon: <Icon size={16} path={mdiTrashCanOutline} />,
        type: MenuTypes.Normal,
        label: translate(lngKeys.GeneralDelete),
        onClick: async () => {
          closeAllModals()
          await deleteDoc(doc)
        },
      }
      const actions: MenuItem[] = [
        editTitleAction,
        duplicateAction,
        deleteDocAction,
      ]

      event.preventDefault()
      event.stopPropagation()
      popup(event, actions)
    },
    [translate, popup, onDocDuplicate, closeAllModals, deleteDoc]
  )

  if (!currentUserIsCoreMember) {
    return <ItemContainer className='item__container'>{children}</ItemContainer>
  }

  const showInput = !sendingMap.has(doc.id) && editingItemTitle
  return (
    <ItemContainer
      onMouseEnter={() => setShowingContextMenuActions(true)}
      onMouseLeave={() => setShowingContextMenuActions(false)}
      className='item__container'
    >
      {showInput && (
        <EditableInput
          editOnStart={true}
          placeholder={'Title...'}
          text={doc.title}
          onTextChange={(newText) => updateDocTitle(doc, newText)}
          onBlur={'submit'}
          onCancel={() => setEditingItemTitle(false)}
          showConfirmation={false}
        />
      )}

      {!showInput && <>{children}</>}

      {showingContextMenuActions && (
        <div className={'item__container__item__actions'}>
          <div
            onClick={(event) => openActionMenu(event, doc)}
            className='doc__action'
          >
            <Icon size={20} path={mdiDotsHorizontal} />
          </div>
        </div>
      )}
    </ItemContainer>
  )
}

export default EditableDocItemContainer

const ItemContainer = styled.div`
  position: relative;

  .item__container__item__actions {
    position: absolute;
    right: 5px;
    z-index: 1;
    margin: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: ${({ theme }) => theme.colors.background.secondary};

    &:hover {
      cursor: pointer;
    }

    .doc__action {
      width: 20px;
      height: 20px;
    }
  }

  .editable__input,
  .editable__input input {
    width: 100% !important;
  }

  .editable__input form {
    max-width: 100% !important;
  }
`
