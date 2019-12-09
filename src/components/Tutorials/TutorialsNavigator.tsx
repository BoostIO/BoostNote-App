import React, { useMemo } from 'react'
import { tutorialsTree, TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import SideNavigatorItem from '../SideNavigator/SideNavigatorItem'
import {
  mdiFolderOpenOutline,
  mdiFolderOutline,
  mdiHelpCircleOutline
} from '@mdi/js'
import {
  useRouteParams,
  useRouter,
  currentTutorialPathname
} from '../../lib/router'
import { useGeneralStatus } from '../../lib/generalStatus'

interface NavigatorNode {
  id: string
  iconPath?: string
  depth: number
  opened: boolean
  name: string
  href: string
  children?: NavigatorNode[]
  active?: boolean
}
interface TutorialsNavigatorProps {}

const TutorialsNavigator = ({  }: TutorialsNavigatorProps) => {
  const routeParams = useRouteParams()
  const { push } = useRouter()
  const currentHref = currentTutorialPathname()
  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()

  const tutorials = tutorialsTree

  function getNavigatorNodesFromTreeItem(
    tree: TutorialsNavigatorTreeItem,
    currentDepth: number,
    parentNode?: NavigatorNode,
    parentComponentPathname?: string
  ): NavigatorNode | undefined {
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
      iconPath:
        tree.type === 'folder'
          ? folderIsActive
            ? mdiFolderOpenOutline
            : mdiFolderOutline
          : mdiHelpCircleOutline,
      href: nodeHref,
      active: folderIsActive,
      depth: currentDepth,
      opened: sideNavOpenedItemSet.has(nodeId)
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
  }

  const nodes = useMemo(() => {
    return tutorials
      .map(tutorial => getNavigatorNodesFromTreeItem(tutorial, 0))
      .filter(node => node != null) as NavigatorNode[]
  }, [routeParams, tutorials, toggleSideNavOpenedItem])

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
          iconPath={node.iconPath}
          active={node.active}
          onClick={() => redirectToTutorialNode(node)}
          onFoldButtonClick={() => toggleSideNavOpenedItem(node.id)}
          folded={
            node.children == null || node.children.length === 0
              ? undefined
              : !node.opened
          }
        />
        {node.children != null &&
          node.children.map(child => renderNode(child, node.opened))}
      </React.Fragment>
    )
  }

  return <>{nodes.map(node => renderNode(node, true))}</>
}

export default TutorialsNavigator
