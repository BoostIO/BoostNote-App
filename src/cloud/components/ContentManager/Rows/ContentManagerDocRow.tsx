import React, { useMemo, useCallback } from 'react'
import {
  DocStatus,
  SerializedDocWithSupplemental,
} from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import ContentManagerRow from './ContentManagerRow'
import { getDocTitle } from '../../../lib/utils/patterns'
import { mdiFileDocumentOutline } from '@mdi/js'
import { getDocLinkHref } from '../../Link/DocLink'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { usePage } from '../../../lib/stores/pageStore'
import { SerializedUser } from '../../../interfaces/db/user'
import { useRouter } from '../../../lib/router'
import styled from '../../../../design/lib/styled'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import DocTagsListItem from '../../DocTagsListItem'
import ContentManagerCell from '../ContentManagerCell'
import { getFormattedBoosthubDateTime } from '../../../lib/date'
import EditorsIcons from '../../EditorsIcons'
import DocAssigneeSelect from '../../DocProperties/DocAssigneeSelect'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import DocStatusSelect from '../../DocProperties/DocStatusSelect'
import DocDueDateSelect from '../../DocProperties/DocDueDateSelect'

interface ContentManagerDocRowProps {
  team: SerializedTeam
  doc: SerializedDocWithSupplemental
  workspace?: SerializedWorkspace
  updating: boolean
  showPath?: boolean
  checked?: boolean
  currentUserIsCoreMember: boolean
  onSelect: (val: boolean) => void
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
  onDragStart: (event: any, doc: SerializedDocWithSupplemental) => void
  onDragEnd: (event: any) => void
  onDrop: (event: any, doc: SerializedDocWithSupplemental) => void
}

const ContentManagerDocRow = ({
  team,
  doc,
  checked,
  workspace,
  showPath,
  currentUserIsCoreMember,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop,
}: ContentManagerDocRowProps) => {
  const { permissions = [] } = usePage()
  const { push } = useRouter()
  const {
    updateDocAssigneeApi,
    updateDocDueDateApi,
    updateDocStatusApi,
    sendingMap,
  } = useCloudApi()

  const fullPath = useMemo(() => {
    if (!showPath) {
      return
    }

    if (workspace == null) {
      return doc.folderPathname
    }

    return `/${workspace.name}${doc.folderPathname}`
  }, [showPath, doc, workspace])

  const editors = useMemo(() => {
    if (
      permissions.length === 0 ||
      doc.head == null ||
      doc.head.creators == null ||
      doc.head.creators.length === 0
    ) {
      return undefined
    }

    const usersMap = permissions.reduce((acc, val) => {
      acc.set(val.user.id, val.user)
      return acc
    }, new Map<string, SerializedUser>())

    return doc.head.creators.reduce((acc, val) => {
      let user
      if (typeof val === 'string') {
        user = usersMap.get(val)
      } else {
        user = usersMap.get(val.id)
      }

      if (user != null) {
        acc.push(user)
      }

      return acc
    }, [] as SerializedUser[])
  }, [permissions, doc])

  const sendUpdateDocAssignees = useCallback(
    async (newAssignees: string[]) => {
      if (sendingMap.has(doc.id)) {
        return
      }

      await updateDocAssigneeApi(doc, newAssignees)
    },
    [doc, updateDocAssigneeApi, sendingMap]
  )

  const sendUpdateStatus = useCallback(
    async (newStatus: DocStatus | null) => {
      if (doc.status === newStatus || sendingMap.has(doc.id)) {
        return
      }

      await updateDocStatusApi(doc, newStatus)
    },
    [doc, sendingMap, updateDocStatusApi]
  )

  const sendUpdateDocDueDate = useCallback(
    async (newDate: Date | null) => {
      if (sendingMap.has(doc.id)) {
        return
      }
      await updateDocDueDateApi(doc, newDate)
    },
    [doc, sendingMap, updateDocDueDateApi]
  )

  const href = getDocLinkHref(doc, team, 'index')

  if (getDocTitle(doc, '').includes('Your Workflow')) console.log(doc.props)

  return (
    <ContentManagerRow
      checked={checked}
      onSelect={onSelect}
      showCheckbox={currentUserIsCoreMember}
      label={
        <DocLabel>
          {fullPath != null && (
            <div className='doc__path'>
              <span className='doc__path__label'>{fullPath}</span>
            </div>
          )}
          <div className='doc__header'>
            <span className='doc__title'>{getDocTitle(doc, 'Untitled')}</span>
            {(doc.tags || []).map((tag) => (
              <DocTagsListItem
                tag={tag}
                team={team}
                key={tag.id}
                showLink={false}
                className='doc__tag'
              />
            ))}
          </div>
          <div className='doc__updated'>
            {getFormattedBoosthubDateTime(doc.updatedAt)}
            {editors != null && editors.length > 0 && (
              <EditorsIcons editors={editors} />
            )}
          </div>
        </DocLabel>
      }
      labelHref={href}
      labelOnclick={() => push(href)}
      defaultIcon={mdiFileDocumentOutline}
      emoji={doc.emoji}
      onDragStart={(event: any) => onDragStart(event, doc)}
      onDragEnd={(event: any) => onDragEnd(event)}
      onDrop={(event: any) => onDrop(event, doc)}
    >
      <ContentManagerCell fullWidth={true}>
        <DocAssigneeSelect
          isLoading={sendingMap.get(doc.id) === 'assignees'}
          disabled={sendingMap.has(doc.id) || !currentUserIsCoreMember}
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
      </ContentManagerCell>
      <ContentManagerCell fullWidth={true}>
        <DocStatusSelect
          status={doc.status}
          sending={sendingMap.get(doc.id) === 'status'}
          onStatusChange={sendUpdateStatus}
          disabled={!currentUserIsCoreMember}
          isReadOnly={!currentUserIsCoreMember}
        />
      </ContentManagerCell>
      <ContentManagerCell fullWidth={true}>
        <DocDueDateSelect
          className='context__content__date_select'
          sending={sendingMap.get(doc.id) === 'duedate'}
          dueDate={doc.dueDate}
          onDueDateChange={sendUpdateDocDueDate}
          disabled={!currentUserIsCoreMember}
          isReadOnly={!currentUserIsCoreMember}
          shortenedLabel={true}
        />
      </ContentManagerCell>
    </ContentManagerRow>
  )
}

const DocLabel = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.sizes.spaces.df}px 0;

  .doc__path,
  .doc__title,
  .doc__tag {
    margin-bottom: 2px !important;
  }

  .doc__path {
    width: 100%;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;

    .doc__path__label {
      ${overflowEllipsis()}
    }
  }

  .doc__title {
    display: inline-block;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    min-height: 20px;
  }

  .doc__updated,
  .doc__updated .editors__icons li {
    color: ${({ theme }) => theme.colors.text.subtle} !important;
  }

  .doc__updated {
    margin-top: 2px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
  }
`

export default React.memo(ContentManagerDocRow)
