import React, { useMemo } from 'react'
import { tutorialsTree, TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import SideNavigatorItem, {
  NavigatorNode
} from '../SideNavigator/SideNavigatorItem'
import {
  mdiFolderOpenOutline,
  mdiFolderOutline,
  mdiHelpCircleOutline
} from '@mdi/js'
import { useRouteParams } from '../../lib/router'

interface TutorialsNavigatorProps {}

const TutorialsNavigator = ({  }: TutorialsNavigatorProps) => {
  const routeParams = useRouteParams()

  const currentHref = useMemo(() => {
    switch (routeParams.name) {
      case 'tutorials.show':
        return routeParams.path
    }
    return null
  }, [routeParams])

  const tutorials = tutorialsTree

  function getNavigatorNodesFromTreeItem(
    tree: TutorialsNavigatorTreeItem,
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
    const folderIsActive =
      currentHref == null
        ? false
        : currentHref.split('/notes/note:')[0] === nodeHref

    const notesUnderCurrentNode = tree.children.filter(
      child => child.type === 'note'
    )

    const currentNode = {
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
      active: folderIsActive
    }

    const childrenNodes =
      tree.children.length === 0
        ? []
        : (tree.children
            .map(childrenTree =>
              getNavigatorNodesFromTreeItem(
                childrenTree,
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
      .map(tutorial => getNavigatorNodesFromTreeItem(tutorial))
      .filter(node => node != null) as NavigatorNode[]
  }, [routeParams, tutorials])

  return (
    <>
      {nodes.map(node => (
        <SideNavigatorItem key={node.name} node={node} />
      ))}
    </>
  )
}

export default TutorialsNavigator
