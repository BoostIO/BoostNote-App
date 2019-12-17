import React, { useMemo, useCallback } from 'react'
import { tutorialsTree, TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import SideNavigatorItem from '../SideNavigator/SideNavigatorItem'
import { useRouter, useCurrentTutorialPathname } from '../../lib/router'
import { useGeneralStatus } from '../../lib/generalStatus'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { usePreferences } from '../../lib/preferences'
import { IconFile, IconFileOpen, IconHelpOutline } from '../icons'

interface NavigatorNode {
  id: string
  icon: React.ReactNode
  depth: number
  opened: boolean
  name: string
  href: string
  children: NavigatorNode[]
  active?: boolean
}

const TutorialsNavigator = ({}) => {
  const { push } = useRouter()
  const currentHref = useCurrentTutorialPathname()
  const { popup } = useContextMenu()
  const { messageBox } = useDialog()
  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()
  const { setPreferences } = usePreferences()

  const tutorials = tutorialsTree

  const getNavigatorNodesFromTreeItem = useCallback(
    (
      tree: TutorialsNavigatorTreeItem,
      currentDepth: number,
      parentNode?: NavigatorNode,
      parentComponentPathname?: string
    ): NavigatorNode | undefined => {
      if (tree.type === 'note') {
        return
      }

      const componentPathname = `${parentComponentPathname != null &&
        parentComponentPathname}/${tree.absolutePath}`
      const nodeHref = `${parentNode != null ? parentNode.href : '/app'}/${
        tree.slug
      }`

      const folderIsActive = currentHref.split('/notes/note:')[0] === nodeHref

      const notesUnderCurrentNode = tree.children.filter(
        child => child.type === 'note'
      )

      const nodeId = `TF-${nodeHref.split('/app')[1]}`
      const currentNode = {
        id: nodeId,
        name: `${tree.label} ${
          notesUnderCurrentNode.length > 0
            ? `(${notesUnderCurrentNode.length})`
            : ''
        }`,
        icon:
          tree.type === 'folder' ? (
            folderIsActive ? (
              <IconFileOpen size='1.3em' />
            ) : (
              <IconFile />
            )
          ) : (
            <IconHelpOutline size='1.3em' />
          ),
        href: nodeHref,
        active: folderIsActive,
        depth: currentDepth,
        opened: sideNavOpenedItemSet.has(nodeId),
        children: []
      }

      const childrenNodes =
        tree.children.length === 0
          ? []
          : (tree.children
              .map(childrenTree =>
                getNavigatorNodesFromTreeItem(
                  childrenTree,
                  currentDepth + 1,
                  currentNode,
                  componentPathname
                )
              )
              .filter(node => node != null) as NavigatorNode[])
      return {
        ...currentNode,
        children: childrenNodes
      }
    },
    [currentHref, sideNavOpenedItemSet]
  )

  const createOnContextMenuHandler = (depth: number) => {
    return (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'Remove folder',
          enabled: depth === 0,
          onClick: () => {
            messageBox({
              title: `Hide tutorials`,
              message:
                'You can choose to display them again in your preferences.',
              iconType: DialogIconTypes.Warning,
              buttons: ['Hide', 'Cancel'],
              defaultButtonIndex: 0,
              cancelButtonIndex: 1,
              onClose: () => {
                setPreferences({ 'general.tutorials': 'hide' })
              }
            })
          }
        }
      ])
    }
  }

  const nodes = useMemo(() => {
    return tutorials
      .map(tutorial => getNavigatorNodesFromTreeItem(tutorial, 0))
      .filter(node => node != null) as NavigatorNode[]
  }, [tutorials, getNavigatorNodesFromTreeItem])

  const redirectToTutorialNode = (node: NavigatorNode) => {
    push(node.href)
  }

  const renderNode = (
    node: NavigatorNode,
    parentNodeIsOpened: boolean
  ): JSX.Element | null => {
    if (node.depth > 0 && !parentNodeIsOpened) {
      return null
    }
    return (
      <React.Fragment key={node.id}>
        <SideNavigatorItem
          label={node.name}
          depth={node.depth}
          icon={node.icon}
          active={node.active}
          onClick={() => redirectToTutorialNode(node)}
          onFoldButtonClick={() => toggleSideNavOpenedItem(node.id)}
          folded={node.children.length === 0 ? undefined : !node.opened}
          onContextMenu={createOnContextMenuHandler(node.depth)}
        />
        {node.children.map(child => renderNode(child, node.opened))}
      </React.Fragment>
    )
  }

  return <>{nodes.map(node => renderNode(node, true))}</>
}

export default TutorialsNavigator
