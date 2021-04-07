import React, { useMemo } from 'react'
import {
  getWorkspaceShowPageData,
  WorkspacesShowPageResponseBody,
} from '../../../../cloud/api/pages/teams/workspaces'
import { SerializedUser } from '../../../../cloud/interfaces/db/user'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../../cloud/interfaces/pages'
import { useGlobalData } from '../../../../cloud/lib/stores/globalData'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { usePreferences } from '../../../../cloud/lib/stores/preferences'
import { useWorkspaceDelete } from '../../../../lib/v2/hooks/cloud/useWorkspaceDelete'
import {
  mapUsers,
  mapUsersWithAccess,
  AppUser,
} from '../../../../lib/v2/mappers/users'
import WorkspaceShowPageTemplate from '../../templates/cloud/WorkspaceShowPageTemplate'
import ErrorLayout from '../../templates/ErrorLayout'
import { prop } from 'ramda'
import { SerializedDoc } from '../../../../cloud/interfaces/db/doc'
import { compareDateString } from '../../../../lib/v2/date'
import { getDocLinkHref } from '../../../../cloud/components/atoms/Link/DocLink'
import { Url, useRouter } from '../../../../cloud/lib/router'
import { SerializedTeam } from '../../../../cloud/interfaces/db/team'
import { RoundedImageProps } from '../../atoms/RoundedImage'
import { getDocTitle } from '../../../../cloud/lib/utils/patterns'
import { mapTopbarTree } from '../../../../lib/v2/mappers/cloud/topbarTree'
import { getWorkspaceHref } from '../../../../cloud/components/atoms/Link/WorkspaceLink'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import EditWorkspaceModal from '../../../../cloud/components/organisms/Modal/contents/Workspace/EditWorkspaceModal'
import { useModal } from '../../../../lib/v2/stores/modal'
import { mapManagerRows } from '../../../../lib/v2/mappers/cloud/contentManager'

const WorkspaceShowPage = ({
  pageWorkspace,
}: WorkspacesShowPageResponseBody) => {
  const { workspacesMap } = useNav()
  const { team } = usePage()
  const {
    globalData: { currentUser },
  } = useGlobalData()

  const workspace = useMemo(() => {
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace.id])

  if (currentUser == null) {
    return <ErrorLayout message={'You need to be connected'} />
  }

  if (team == null) {
    return <ErrorLayout message={'Team has been deleted'} />
  }

  if (workspace == null) {
    return <ErrorLayout message={'Workspace has been removed'} />
  }

  return <Page workspace={workspace} currentUser={currentUser} team={team} />
}

const Page = ({
  workspace,
  currentUser,
  team,
}: {
  workspace: SerializedWorkspace
  currentUser: SerializedUser
  team: SerializedTeam
}) => {
  const { preferences, setPreferences } = usePreferences()
  const { permissions = [], guestsMap } = usePage()
  const { push, goBack, goForward } = useRouter()
  const { initialLoadDone, docsMap, foldersMap, workspacesMap } = useNav()
  const workspaceRemoval = useWorkspaceDelete()
  const { openModal } = useModal()

  const breadcrumbsTree = useMemo(() => {
    return mapTopbarTree(
      team,
      initialLoadDone,
      docsMap,
      foldersMap,
      workspacesMap,
      push
    )
  }, [docsMap, foldersMap, workspacesMap, initialLoadDone, push, team])

  const users = useMemo(() => {
    return mapUsersWithAccess(
      permissions,
      {
        permissions: new Set((workspace.permissions || []).map(prop('id'))),
        owner: workspace.ownerId,
      },
      currentUser,
      [...guestsMap.values()]
    )
  }, [
    permissions,
    currentUser,
    workspace.ownerId,
    workspace.permissions,
    guestsMap,
  ])

  const timelineRows = useMemo(() => {
    return mapShallowTimelineRows(
      mapUsers(permissions),
      [...docsMap.values()].filter(
        (doc) => doc.workspaceId === workspace.id && doc.parentFolderId == null
      ),
      push,
      team
    )
  }, [permissions, docsMap, workspace.id, push, team])

  const managerRows = useMemo(() => {
    return mapManagerRows(
      team,
      { workspaceId: workspace.id },
      docsMap,
      foldersMap
    )
  }, [workspace.id, docsMap, foldersMap, team])

  return (
    <WorkspaceShowPageTemplate
      topbarControls={[
        {
          icon: !preferences.docContextIsHidden
            ? mdiChevronLeft
            : mdiChevronRight,
          onClick: () =>
            setPreferences({
              docContextIsHidden: !preferences.docContextIsHidden,
            }),
        },
      ]}
      topbarNavigation={{ goBack, goForward }}
      topbarTree={breadcrumbsTree}
      metadata={{ show: !preferences.docContextIsHidden }}
      workspaceRemoval={{
        sending: workspaceRemoval.sending,
        call: () => workspaceRemoval.call(workspace),
      }}
      workspace={workspace}
      workspaceHref={`${process.env.BOOST_HUB_BASE_URL}${getWorkspaceHref(
        workspace,
        team,
        'index'
      )}`}
      users={users}
      managerRows={managerRows}
      timelineRows={timelineRows}
      push={push}
      editWorkspace={() =>
        openModal(<EditWorkspaceModal workspace={workspace} />)
      }
    />
  )
}

function mapShallowTimelineRows(
  users: Map<string, AppUser>,
  docs: SerializedDoc[],
  push: (url: Url) => void,
  team: SerializedTeam,
  limit = 5
) {
  if (docs.length === 0) {
    return []
  }

  return docs
    .sort((a, b) =>
      compareDateString(
        a.head?.created || a.updatedAt,
        b.head?.created || b.updatedAt,
        'DESC'
      )
    )
    .slice(0, limit)
    .map((doc) => {
      const href = getDocLinkHref(doc, team, 'index')
      const creators = (doc.head?.creators || []).reduce((acc, creator) => {
        const user = users.get(creator.id)
        if (user != null) {
          acc.push({
            url: user.iconUrl,
            alt: user.name,
            color: user.color,
          })
        }
        return acc
      }, [] as RoundedImageProps[])

      return {
        date: doc.head?.created || doc.updatedAt,
        source: {
          label: getDocTitle(doc, 'a doc'),
          href,
          onClick: () => push(href),
        },
        users: creators,
      }
    })
}

WorkspaceShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getWorkspaceShowPageData(params)
  return result
}

export default WorkspaceShowPage
