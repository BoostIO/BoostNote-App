import {
  mdiAccountCircleOutline,
  mdiAccountMultiple,
  mdiClockOutline,
  mdiContentSaveOutline,
  mdiText,
  mdiFormatLetterCase,
} from '@mdi/js'
import React, { useMemo, useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import {
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../interfaces/db/doc'
import { SerializedRevision } from '../../interfaces/db/revision'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedUser } from '../../interfaces/db/user'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import { getFormattedDateTime } from '../../lib/date'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { useNav } from '../../lib/stores/nav'
import UserIcon from '../UserIcon'
import BackLinksList from './BackLinksList'
import DocContextMenuActions from './DocContextMenuActions'

interface DocContextMenuProps {
  currentDoc: SerializedDocWithBookmark
  contributors?: SerializedUser[]
  backLinks?: SerializedDoc[]
  team: SerializedTeam
  permissions: SerializedUserTeamPermissions[]
  currentUserIsCoreMember: boolean
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
  restoreRevision?: (revision: SerializedRevision) => void
  isCanvas?: boolean
}

const DocContextMenu = ({
  team,
  currentDoc: doc,
  contributors = [],
  backLinks = [],
  permissions,
  currentUserIsCoreMember,
  editorRef,
  restoreRevision,
  isCanvas,
}: DocContextMenuProps) => {
  const [sliceContributors, setSliceContributors] = useState(true)
  const { docsMap } = useNav()
  const { translate } = useI18n()

  const currentDoc = useMemo(() => {
    return docsMap.get(doc.id)
  }, [docsMap, doc.id])

  const usersMap = useMemo(() => {
    const users = permissions.reduce((acc, val) => {
      acc.set(val.user.id, val.user)
      return acc
    }, new Map<string, SerializedUser>())

    return users
  }, [permissions])

  const contributorsState = useMemo(() => {
    let allContributors = contributors
    let sliced = 0
    if (sliceContributors && contributors.length > 5) {
      allContributors = contributors.slice(0, 5)
      sliced = contributors.length - 5
    }

    return {
      contributors: allContributors,
      sliced,
    }
  }, [contributors, sliceContributors])

  const creator =
    currentDoc != null && currentDoc.userId != null
      ? usersMap.get(currentDoc.userId)
      : undefined

  const contentCounters = useMemo(() => {
    return {
      wordCount: currentDoc?.head?.content.match(/\S+/g)?.length || 0,
      characterCount: currentDoc?.head?.content.replace(/\s+/g, '').length || 0,
    }
  }, [currentDoc?.head?.content])

  if (currentDoc == null) {
    return (
      <MetadataContainer
        rows={[{ type: 'header', content: translate(lngKeys.DocInfo) }]}
      >
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Doc has been deleted',
              disabled: true,
            },
          }}
        />
      </MetadataContainer>
    )
  }

  return (
    <MetadataContainer
      rows={[{ type: 'header', content: translate(lngKeys.DocInfo) }]}
    >
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.CreationDate),
          type: 'content',
          icon: mdiClockOutline,
          content: getFormattedDateTime(
            currentDoc.createdAt,
            undefined,
            'MMM dd, yyyy, HH:mm'
          ),
        }}
      />
      {creator != null && (
        <MetadataContainerRow
          row={{
            label: translate(lngKeys.CreatedBy),
            type: 'content',
            icon: mdiAccountCircleOutline,
            content: (
              <Flexbox wrap='wrap'>
                <UserIcon key={creator.id} user={creator} className='subtle' />
              </Flexbox>
            ),
          }}
        />
      )}
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.UpdateDate),
          type: 'content',
          icon: mdiContentSaveOutline,
          content:
            currentDoc.head != null
              ? getFormattedDateTime(
                  currentDoc.head.created,
                  undefined,
                  'MMM dd, yyyy, HH:mm'
                )
              : getFormattedDateTime(
                  currentDoc.updatedAt,
                  undefined,
                  'MMM dd, yyyy, HH:mm'
                ),
        }}
      />
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.UpdatedBy),
          type: 'content',
          icon: mdiAccountCircleOutline,
          content: (
            <Flexbox wrap='wrap'>
              {currentDoc.head != null &&
              (currentDoc.head.creators || []).length > 0 ? (
                <>
                  {(currentDoc.head.creators || []).map((user) => (
                    <UserIcon
                      key={user.id}
                      user={usersMap.get(user.id) || user}
                      className='subtle'
                    />
                  ))}
                </>
              ) : (
                ''
              )}
            </Flexbox>
          ),
        }}
      />
      {!isCanvas && (
        <MetadataContainerRow
          row={{
            label: translate(lngKeys.Contributors),
            type: 'content',
            icon: mdiAccountMultiple,
            content: (
              <Flexbox wrap='wrap'>
                {contributorsState.contributors.map((contributor) => (
                  <UserIcon
                    key={contributor.id}
                    user={usersMap.get(contributor.id) || contributor}
                    className='subtle'
                  />
                ))}
                {contributors.length > 0 && (
                  <>
                    <div style={{ marginRight: 5 }} />
                    <Button
                      size='sm'
                      variant='transparent'
                      onClick={() => setSliceContributors((prev) => !prev)}
                    >
                      {contributorsState.sliced > 0
                        ? `+${contributorsState.sliced}`
                        : '-'}
                    </Button>
                  </>
                )}
              </Flexbox>
            ),
          }}
        />
      )}
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.WordCount),
          type: 'content',
          icon: mdiFormatLetterCase,
          content: contentCounters.wordCount,
        }}
      />
      <MetadataContainerRow
        row={{
          label: translate(lngKeys.CharacterCount),
          type: 'content',
          icon: mdiText,
          content: contentCounters.characterCount,
        }}
      />
      <BackLinksList team={team} docs={backLinks} />
      <MetadataContainerBreak />
      <DocContextMenuActions
        team={team}
        doc={currentDoc}
        editorRef={editorRef}
        currentUserIsCoreMember={currentUserIsCoreMember}
        restoreRevision={restoreRevision}
        isCanvas={isCanvas}
      />
    </MetadataContainer>
  )
}

export default React.memo(DocContextMenu)
