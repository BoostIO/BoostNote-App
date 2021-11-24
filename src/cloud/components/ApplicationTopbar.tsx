import { mdiTag, mdiViewDashboard, mdiWeb } from '@mdi/js'
import { capitalize } from 'lodash'
import React, { PropsWithChildren, useMemo } from 'react'
import Topbar, {
  TopbarControlProps,
} from '../../design/components/organisms/Topbar'
import { getTagHref } from '../../mobile/lib/href'
import { SerializedWorkspace } from '../interfaces/db/workspace'
import { useCloudResourceModals } from '../lib/hooks/useCloudResourceModals'
import { useI18n } from '../lib/hooks/useI18n'
import { lngKeys } from '../lib/i18n/types'
import {
  mapTopbarBreadcrumbs,
  mapWorkspaceBreadcrumb,
} from '../lib/mappers/topbarBreadcrumbs'
import { mapTopbarTree, topParentId } from '../lib/mappers/topbarTree'
import { useRouter } from '../lib/router'
import { useNav } from '../lib/stores/nav'
import { usePage } from '../lib/stores/pageStore'
import { getTeamLinkHref } from './Link/TeamLink'

interface ApplicationTopbarProps {
  controls?: TopbarControlProps[]
}

const ApplicationTopbar = ({
  children,
  controls,
}: PropsWithChildren<ApplicationTopbarProps>) => {
  const { push, goBack, goForward, pathname } = useRouter()
  const {
    team,
    pageWorkspace,
    pageDoc,
    pageFolder,
    currentUserIsCoreMember,
    pageTag,
  } = usePage()
  const {
    openNewDocForm,
    openNewFolderForm,
    openRenameDocForm,
    openRenameFolderForm,
    openWorkspaceEditForm,
    deleteWorkspace,
    deleteDoc,
    deleteFolder,
  } = useCloudResourceModals()
  const {
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    tagsMap,
  } = useNav()

  const { translate } = useI18n()

  const topbarTree = useMemo(() => {
    if (team == null) {
      return undefined
    }

    return mapTopbarTree(
      team,
      initialLoadDone,
      docsMap,
      foldersMap,
      workspacesMap,
      push
    )
  }, [team, initialLoadDone, docsMap, foldersMap, workspacesMap, push])

  const tag = useMemo(() => {
    if (pageTag == null) return undefined
    return tagsMap.get(pageTag.id)
  }, [tagsMap, pageTag])

  const workspace = useMemo(() => {
    if (pageWorkspace == null) {
      return undefined
    }
    return workspacesMap.get(pageWorkspace.id)
  }, [workspacesMap, pageWorkspace])

  const doc = useMemo(() => {
    if (pageDoc == null) {
      return undefined
    }
    return docsMap.get(pageDoc.id)
  }, [docsMap, pageDoc])

  const folder = useMemo(() => {
    if (pageFolder == null) {
      return undefined
    }
    return foldersMap.get(pageFolder.id)
  }, [foldersMap, pageFolder])

  const topbarBreadcrumbs = useMemo(() => {
    if (team == null) {
      return []
    }

    let defaultWorkspace: null | SerializedWorkspace = null
    for (const workspace of workspacesMap.values()) {
      if (workspace.default) {
        defaultWorkspace = workspace
        break
      }
    }
    if (defaultWorkspace == null) {
      return []
    }

    const [, ...splittedPathnames] = pathname.split('/')
    if (splittedPathnames.length === 1) {
      return [
        {
          label: defaultWorkspace.name,
          active: true,
          parentId: topParentId,
          link: {
            href: getTeamLinkHref(team, 'index'),
            navigateTo: () => push(getTeamLinkHref(team, 'index')),
          },
        },
      ]
    }

    if (splittedPathnames.length >= 2 && splittedPathnames[1] === 'shared') {
      return [
        {
          label: capitalize(translate(lngKeys.GeneralShared)),
          active: true,
          parentId: topParentId,
          icon: mdiWeb,
          link: {
            href: getTeamLinkHref(team, 'shared'),
            navigateTo: () => push(getTeamLinkHref(team, 'shared')),
          },
        },
      ]
    }

    if (splittedPathnames.length >= 2 && splittedPathnames[1] === 'dashboard') {
      return [
        {
          label: capitalize(translate(lngKeys.GeneralSmartViews)),
          active: true,
          parentId: topParentId,
          icon: mdiViewDashboard,
          link: {
            href: getTeamLinkHref(team, 'dashboard'),
            navigateTo: () => push(getTeamLinkHref(team, 'dashboard')),
          },
        },
      ]
    }

    if (tag != null) {
      return [
        {
          label: tag.text,
          active: true,
          parentId: topParentId,
          icon: mdiTag,
          link: {
            href: getTagHref(tag, team, 'index'),
            navigateTo: () => push(getTagHref(tag, team, 'index')),
          },
        },
      ]
    }

    if (workspace != null) {
      if (!currentUserIsCoreMember) {
        return [mapWorkspaceBreadcrumb(translate, team, workspace, push)]
      } else {
        return [
          mapWorkspaceBreadcrumb(
            translate,
            team,
            workspace,
            push,
            openNewDocForm,
            openNewFolderForm,
            openWorkspaceEditForm,
            deleteWorkspace
          ),
        ]
      }
    }

    const content =
      doc != null
        ? { pageDoc: { ...doc, head: { ...(doc.head || {}) } } }
        : { pageFolder: folder }

    if (!currentUserIsCoreMember) {
      return mapTopbarBreadcrumbs(
        translate,
        team,
        foldersMap,
        workspacesMap,
        push,
        content as any
      )
    }

    return mapTopbarBreadcrumbs(
      translate,
      team,
      foldersMap,
      workspacesMap,
      push,
      content as any,
      openRenameFolderForm,
      openRenameDocForm,
      openNewDocForm,
      openNewFolderForm,
      openWorkspaceEditForm,
      deleteDoc,
      deleteFolder,
      deleteWorkspace
    )
  }, [
    team,
    currentUserIsCoreMember,
    doc,
    folder,
    workspace,
    translate,
    push,
    openNewDocForm,
    openNewFolderForm,
    openWorkspaceEditForm,
    deleteWorkspace,
    deleteDoc,
    deleteFolder,
    foldersMap,
    workspacesMap,
    openRenameDocForm,
    openRenameFolderForm,
    pathname,
    tag,
  ])

  return (
    <Topbar
      tree={topbarTree}
      controls={controls}
      navigation={{ goBack, goForward }}
      breadcrumbs={topbarBreadcrumbs}
      className='topbar'
    >
      {children}
    </Topbar>
  )
}

export default React.memo(ApplicationTopbar)
