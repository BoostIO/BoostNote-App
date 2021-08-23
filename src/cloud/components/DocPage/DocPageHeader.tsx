import React, { useCallback, useState } from 'react'
import styled from '../../../design/lib/styled'
import { DocStatus, SerializedDocWithBookmark } from '../../interfaces/db/doc'
import cc from 'classcat'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import Button from '../../../design/components/atoms/Button'
import Icon from '../../../design/components/atoms/Icon'
import { mdiCommentTextOutline, mdiPencil } from '@mdi/js'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import {
  updateDocAssignees,
  updateDocDueDate,
  updateDocStatus,
} from '../../api/teams/docs'
import { format as formatDate } from 'date-fns'
import { useToast } from '../../../design/lib/stores/toast'
import DocAssigneeSelect from '../DocProperties/DocAssigneeSelect'
import DocTagsList from './DocTagsList'
import { SerializedTeam } from '../../interfaces/db/team'
import DocStatusSelect from '../DocProperties/DocStatusSelect'
import DocDueDateSelect from '../DocProperties/DocDueDateSelect'
import { usePreferences } from '../../lib/stores/preferences'
import { overflowEllipsis } from '../../../design/lib/styled/styleFunctions'
import { getDocTitle } from '../../lib/utils/patterns'

interface DocPageHeaderProps {
  docIsEditable?: boolean
  doc: SerializedDocWithBookmark
  className?: string
  team: SerializedTeam
}

const DocPageHeader = ({
  doc,
  docIsEditable,
  className,
  team,
}: DocPageHeaderProps) => {
  const { openRenameDocForm } = useCloudResourceModals()
  const { currentUserIsCoreMember, setPartialPageData } = usePage()
  const [sendingUpdateStatus, setSendingUpdateStatus] = useState(false)
  const [sendingDueDate, setSendingDueDate] = useState(false)
  const [sendingAssignees, setSendingAssignees] = useState(false)
  const { updateDocsMap } = useNav()
  const { pushMessage } = useToast()
  const { preferences, setPreferences } = usePreferences()

  const sendUpdateStatus = useCallback(
    async (newStatus: DocStatus | null) => {
      if (doc.status === newStatus || sendingUpdateStatus) {
        return
      }

      setSendingUpdateStatus(true)
      try {
        const data = await updateDocStatus(doc.teamId, doc.id, newStatus)
        updateDocsMap([data.doc.id, data.doc])
        setPartialPageData({ pageDoc: data.doc })
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not change status',
        })
      }
      setSendingUpdateStatus(false)
    },
    [doc, pushMessage, sendingUpdateStatus, setPartialPageData, updateDocsMap]
  )

  const sendUpdateDocDueDate = useCallback(
    async (newDate: Date | null) => {
      if (sendingDueDate) {
        return
      }

      setSendingDueDate(true)
      try {
        const data = await updateDocDueDate(
          doc.teamId,
          doc.id,
          newDate != null
            ? new Date(formatDate(newDate, 'yyyy-MM-dd') + 'T00:00:00.000Z')
            : null
        )
        updateDocsMap([data.doc.id, data.doc])
        setPartialPageData({ pageDoc: data.doc })
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not update due date',
        })
      }
      setSendingDueDate(false)
    },
    [doc, pushMessage, sendingDueDate, setPartialPageData, updateDocsMap]
  )

  const sendUpdateDocAssignees = useCallback(
    async (newAssignees: string[]) => {
      if (sendingAssignees) {
        return
      }

      setSendingAssignees(true)
      try {
        const data = await updateDocAssignees(doc.teamId, doc.id, newAssignees)
        updateDocsMap([data.doc.id, data.doc])
        setPartialPageData({ pageDoc: data.doc })
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not update assignees',
        })
      }
      setSendingAssignees(false)
    },
    [doc, pushMessage, sendingAssignees, setPartialPageData, updateDocsMap]
  )

  return (
    <Container className={cc(['doc__page__header', className])}>
      <div className='doc__page__padding'>
        {docIsEditable ? (
          <Button
            variant='transparent'
            className={cc([
              'doc__page__header__title',
              'doc__page__header__title--button',
            ])}
            onClick={() => openRenameDocForm(doc)}
          >
            <span className='doc__page__header__label'>
              {getDocTitle(doc, 'Untitled')}
            </span>
            <Icon path={mdiPencil} className='doc__page__header__icon' />
          </Button>
        ) : (
          <div className={cc(['doc__page__header__title'])}>
            <span className='doc__page__header__label'>{doc.title}</span>
          </div>
        )}

        <div className='doc__page__header__wrapper'>
          <div className='doc__page__header__props'>
            <div className='doc__page__header__property'>
              <DocAssigneeSelect
                isLoading={sendingAssignees}
                disabled={sendingAssignees || !currentUserIsCoreMember}
                defaultValue={
                  doc.assignees != null
                    ? doc.assignees.map((assignee) => assignee.userId)
                    : []
                }
                readOnly={!currentUserIsCoreMember}
                update={sendUpdateDocAssignees}
              />
            </div>
            <div className='doc__page__header__property'>
              <DocStatusSelect
                status={doc.status}
                sending={sendingUpdateStatus}
                onStatusChange={sendUpdateStatus}
                disabled={!currentUserIsCoreMember}
                isReadOnly={!currentUserIsCoreMember}
              />
            </div>
            <div className='doc__page__header__property'>
              <DocDueDateSelect
                className='context__content__date_select'
                sending={sendingDueDate}
                dueDate={doc.dueDate}
                onDueDateChange={sendUpdateDocDueDate}
                disabled={!currentUserIsCoreMember}
                isReadOnly={!currentUserIsCoreMember}
              />
            </div>
            <div className='doc__page__header__property'>
              <DocTagsList
                team={team}
                doc={doc}
                readOnly={!currentUserIsCoreMember}
              />
            </div>
          </div>
          <Button
            className='doc__page__header__comments'
            variant='icon'
            iconPath={mdiCommentTextOutline}
            active={preferences.docContextMode === 'comment'}
            onClick={() =>
              setPreferences(({ docContextMode }) => ({
                docContextMode:
                  docContextMode === 'comment' ? 'hidden' : 'comment',
              }))
            }
          />
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;

  .doc__page__padding {
    margin: 0 ${({ theme }) => theme.sizes.spaces.md}px;
    width: auto;
    padding-top: ${({ theme }) => theme.sizes.spaces.df}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .prop__margin {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px !important;
  }

  .doc__page__header__comments {
    flex: 0 0 auto;
  }

  .doc__page__header__wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__page__header__title {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    color: ${({ theme }) => theme.colors.text.primary};
    width: fit-content;
    width: 100%;

    .button__label {
      max-width: 100%;
    }

    .doc__page__header__label {
      ${overflowEllipsis}
    }

    &.doc__page__header__title--button {
      justify-content: flex-start;
      .doc__page__header__icon {
        display: none;
        margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
        flex: 0 0 auto;
      }
      &:hover {
        .doc__page__header__icon {
          display: block;
        }
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }
  }

  .doc__page__header__props {
    display: flex;
    flex: 1 1 auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .doc__page__header__property {
    flex: 0 0 auto;
    width: fit-content;
    .form__select__control {
      width: 90px !important;
    }
  }
`

export default React.memo(DocPageHeader)
