import React, { useCallback } from 'react'
import styled from '../../../design/lib/styled'
import {
  DocStatus,
  SerializedDocWithSupplemental,
} from '../../interfaces/db/doc'
import cc from 'classcat'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import Button from '../../../design/components/atoms/Button'
import Icon from '../../../design/components/atoms/Icon'
import { mdiCommentTextOutline, mdiPencil } from '@mdi/js'
import { usePage } from '../../lib/stores/pageStore'
import { format as formatDate } from 'date-fns'
import DocAssigneeSelect from '../DocProperties/DocAssigneeSelect'
import DocTagsList from './DocTagsList'
import { SerializedTeam } from '../../interfaces/db/team'
import DocStatusSelect from '../DocProperties/DocStatusSelect'
import DocDueDateSelect from '../DocProperties/DocDueDateSelect'
import { usePreferences } from '../../lib/stores/preferences'
import { overflowEllipsis } from '../../../design/lib/styled/styleFunctions'
import { getDocTitle } from '../../lib/utils/patterns'
import ViewerDisclaimer from '../ViewerDisclaimer'
import { useCloudApi } from '../../lib/hooks/useCloudApi'

interface DocPageHeaderProps {
  docIsEditable?: boolean
  doc: SerializedDocWithSupplemental
  className?: string
  team: SerializedTeam
}

const DocPageHeader = ({
  doc,
  docIsEditable,
  className,
  team,
}: DocPageHeaderProps) => {
  const {
    updateDocStatusApi,
    updateDocDueDateApi,
    updateDocAssigneeApi,
    sendingMap,
  } = useCloudApi()
  const { openRenameDocForm } = useCloudResourceModals()
  const { currentUserIsCoreMember } = usePage()
  const { preferences, setPreferences } = usePreferences()

  const sendUpdateStatus = useCallback(
    async (newStatus: DocStatus | null) => {
      if (doc.status === newStatus) {
        return
      }

      await updateDocStatusApi(doc, newStatus)
    },
    [doc, updateDocStatusApi]
  )

  const sendUpdateDocDueDate = useCallback(
    async (newDate: Date | null) => {
      await updateDocDueDateApi(
        doc,
        newDate != null
          ? new Date(formatDate(newDate, 'yyyy-MM-dd') + 'T00:00:00.000Z')
          : null
      )
    },
    [doc, updateDocDueDateApi]
  )

  const sendUpdateDocAssignees = useCallback(
    async (newAssignees: string[]) => {
      await updateDocAssigneeApi(doc, newAssignees)
    },
    [doc, updateDocAssigneeApi]
  )

  return (
    <Container className={cc(['doc__page__header', className])}>
      <div className='doc__page__padding'>
        <ViewerDisclaimer />
        {docIsEditable ? (
          <Button
            variant='transparent'
            className={cc([
              'doc__page__header__title',
              !currentUserIsCoreMember && 'doc__page__header__title--disabled',
            ])}
            disabled={!currentUserIsCoreMember}
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
                isLoading={sendingMap.get(doc.id) === 'assignees'}
                disabled={
                  sendingMap.get(doc.id) === 'assignees' ||
                  !currentUserIsCoreMember
                }
                defaultValue={
                  doc.props.assignees != null
                    ? Array.isArray(doc.props.assignees.data)
                      ? doc.props.assignees.data.map((data) => data.userId)
                      : [doc.props.assignees.data.userId]
                    : []
                }
                readOnly={!currentUserIsCoreMember}
                update={sendUpdateDocAssignees}
              />
            </div>
            <div className='doc__page__header__property'>
              <DocStatusSelect
                status={
                  typeof doc.props.status?.data === 'string'
                    ? (doc.props.status.data as DocStatus)
                    : null
                }
                sending={sendingMap.get(doc.id) === 'status'}
                onStatusChange={sendUpdateStatus}
                disabled={!currentUserIsCoreMember}
                isReadOnly={!currentUserIsCoreMember}
              />
            </div>
            <div className='doc__page__header__property'>
              <DocDueDateSelect
                className='context__content__date_select'
                sending={sendingMap.get(doc.id) === 'duedate'}
                dueDate={doc.props.dueDate?.data}
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
    justify-content: flex-start;

    .doc__page__header__icon {
      display: none;
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .button__label {
      max-width: 100%;
    }

    .doc__page__header__label {
      ${overflowEllipsis}
    }

    &:not(.doc__page__header__title--disabled) {
      .doc__page__header__icon {
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
