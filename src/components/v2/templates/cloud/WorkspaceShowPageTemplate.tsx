import React, { useMemo } from 'react'
import MetadataContainer, {
  MetadataContainerRow,
} from '../../organisms/MetadataContainer'
import ContentLayout from '../ContentLayout'
import { SerializedWorkspace } from '../../../../cloud/interfaces/db/workspace'
import { mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import Button from '../../atoms/Button'
import UserIconList from '../../molecules/UserIconList'
import { AppUser } from '../../../../lib/v2/mappers/users'
import ShallowTimeline, {
  ShallowTimelineRow,
} from '../../organisms/ShallowTimeline'
import {
  BreadCrumbTreeItem,
  ContentManagerItemProps,
} from '../../../../lib/v2/mappers/types'
import { topParentId } from '../../../../lib/v2/mappers/cloud/topbarTree'
import ContentManager from '../../organisms/ContentManager'

interface WorkspaceShowPageTemplateProps<T> {
  topbarControls: any[]
  topbarTree?: Map<string, BreadCrumbTreeItem[]>
  topbarNavigation: { goBack: () => void; goForward: () => void }
  helmet?: { title?: string; indexing?: boolean }
  metadata: { show: boolean }
  workspace: SerializedWorkspace
  workspaceHref: string
  workspaceRemoval: {
    sending: boolean
    call: () => void
  }
  users: Map<string, AppUser & { hasAccess?: boolean; isOwner?: boolean }>
  timelineRows: ShallowTimelineRow[]
  managerRows: ContentManagerItemProps<T>[]
  push: (url: string) => void
  editWorkspace: () => void
}

const WorkspaceShowPageTemplate = <
  T extends 'documents' | 'archived' | 'folders'
>({
  topbarControls,
  topbarTree,
  topbarNavigation,
  helmet,
  metadata,
  workspace,
  workspaceHref,
  workspaceRemoval,
  users,
  timelineRows,
  editWorkspace,
  managerRows,
  push,
}: WorkspaceShowPageTemplateProps<T>) => {
  const metadataRows = useMemo(() => {
    const rows: MetadataContainerRow[] = []
    if (workspace.default) {
      rows.push({
        type: 'content',
        label: { text: 'Access' },
        direction: 'column',
        breakAfter: true,
        content: (
          <div>
            This workspace is public and can&apos;t have its access modified.
          </div>
        ),
      })

      rows.push({
        type: 'button',
        label: { text: 'Edit', icon: mdiPencil },
        onClick: editWorkspace,
      })

      rows.push({
        type: 'content',
        label: { text: 'Timeline' },
        direction: 'column',
        content: (
          <ShallowTimeline rows={timelineRows} sourcePlaceholder='this doc' />
        ),
      })

      return rows
    }

    if (workspace.public) {
      rows.push({
        type: 'content',
        label: { text: 'Access' },
        direction: 'column',
        breakAfter: true,
        content: (
          <div>
            This workspace is public. Anyone from the team can access it. You
            can modify its access in the workspace{' '}
            <Button
              variant='link'
              onClick={editWorkspace}
              id='workspace-settings-edit'
            >
              Settings
            </Button>{' '}
          </div>
        ),
      })
    } else {
      rows.push({
        type: 'content',
        label: { text: 'Access' },
        content: (
          <UserIconList
            users={[...users.values()]
              .filter((user) => user.hasAccess)
              .map((user) => {
                return {
                  url: user.iconUrl,
                  alt: user.name,
                  color: user.color,
                }
              })}
          />
        ),
      })
      rows.push({
        type: 'content',
        content: (
          <div>
            This workspace is private. You can modify its access in the
            workspace{' '}
            <Button
              variant='link'
              onClick={editWorkspace}
              id='workspace-settings-edit'
            >
              Settings
            </Button>{' '}
          </div>
        ),
        breakAfter: true,
      })
    }

    rows.push({
      type: 'button',
      label: { text: 'Edit', icon: mdiPencil },
      onClick: editWorkspace,
    })

    rows.push({
      type: 'button',
      label: { text: 'Delete', icon: mdiTrashCanOutline },
      onClick: workspaceRemoval.call,
      disabled: workspaceRemoval.sending,
      breakAfter: true,
    })

    rows.push({
      type: 'content',
      label: { text: 'Timeline' },
      direction: 'column',
      content: (
        <ShallowTimeline rows={timelineRows} sourcePlaceholder='this doc' />
      ),
    })

    return rows
  }, [workspace, workspaceRemoval, editWorkspace, users, timelineRows])

  return (
    <ContentLayout
      topbar={{
        navigation: topbarNavigation,
        tree: topbarTree,
        controls: topbarControls,
        breadcrumbs: [
          {
            label: workspace.name,
            active: true,
            parentId: topParentId,
            link: {
              href: workspaceHref,
              navigateTo: () => push(workspaceHref),
            },
            controls: workspace.default
              ? [
                  {
                    icon: mdiPencil,
                    label: 'Create a document',
                    onClick: () => {
                      //#TOFIX
                    },
                  },
                  {
                    icon: mdiPencil,
                    label: 'Create a folder',
                    onClick: () => {
                      //#TOFIX
                    },
                  },
                  {
                    icon: mdiPencil,
                    label: 'Edit the workspace',
                    onClick: () => editWorkspace(),
                  },
                ]
              : [
                  {
                    icon: mdiPencil,
                    label: 'Create a document',
                    onClick: () => {
                      //#TOFIX
                    },
                  },
                  {
                    icon: mdiPencil,
                    label: 'Create a folder',
                    onClick: () => {
                      //#TOFIX
                    },
                  },
                  {
                    icon: mdiPencil,
                    label: 'Edit the workspace',
                    onClick: () => editWorkspace(),
                  },
                  {
                    icon: mdiPencil,
                    label: 'Delete the workspace',
                    onClick: () => workspaceRemoval.call(),
                  },
                ],
          },
        ],
      }}
      helmet={helmet}
      right={metadata?.show && <MetadataContainer rows={metadataRows} />}
    >
      <ContentManager
        categories={['folders', 'documents', 'archived']}
        items={managerRows}
        push={push}
        users={users}
      />
    </ContentLayout>
  )
}

export default WorkspaceShowPageTemplate
