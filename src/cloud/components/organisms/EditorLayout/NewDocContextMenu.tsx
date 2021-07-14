import {
  mdiAccountCircleOutline,
  mdiAccountMultiple,
  mdiClockOutline,
  mdiContentSaveOutline,
} from '@mdi/js'
import React, { useMemo, useState } from 'react'
import Flexbox from '../../../../shared/components/atoms/Flexbox'
import MetadataContainer from '../../../../shared/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../../shared/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../shared/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import {
  SerializedDoc,
  SerializedDocWithBookmark,
} from '../../../interfaces/db/doc'
import { SerializedRevision } from '../../../interfaces/db/revision'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedUserTeamPermissions } from '../../../interfaces/db/userTeamPermissions'
import { getFormattedDateTime } from '../../../lib/date'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import SmallButton from '../../atoms/SmallButton'
import UserIcon from '../../atoms/UserIcon'
import BackLinksList from './molecules/BackLinksList'
import DocContextMenuActions from './molecules/DocContextMenuActions'

interface DocContextMenuProps {
  currentDoc: SerializedDocWithBookmark
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  team: SerializedTeam
  permissions: SerializedUserTeamPermissions[]
  currentUserIsCoreMember: boolean
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
  restoreRevision?: (revision: SerializedRevision) => void
}

const DocContextMenu = ({
  team,
  currentDoc,
  contributors,
  backLinks,
  permissions,
  currentUserIsCoreMember,
  editorRef,
}: DocContextMenuProps) => {
  const [sliceContributors, setSliceContributors] = useState(true)
  const { translate } = useI18n()

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
    currentDoc.userId != null ? usersMap.get(currentDoc.userId) : undefined

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
      {!team.personal && creator != null && (
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
      {!team.personal && (
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
      )}
      {!team.personal && (
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

                {contributors.length > 5 && (
                  <SmallButton
                    variant='transparent'
                    onClick={() => setSliceContributors((prev) => !prev)}
                  >
                    {contributorsState.sliced > 0
                      ? `+${contributorsState.sliced}`
                      : '-'}
                  </SmallButton>
                )}
              </Flexbox>
            ),
          }}
        />
      )}
      <BackLinksList team={team} docs={backLinks} />
      <MetadataContainerBreak />
      <DocContextMenuActions
        team={team}
        doc={currentDoc}
        editorRef={editorRef}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </MetadataContainer>
  )
}

export default React.memo(DocContextMenu)
