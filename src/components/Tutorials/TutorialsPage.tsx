import React, { useCallback, useMemo } from 'react'
import { tutorialsTree, TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import TwoPaneLayout from '../atoms/TwoPaneLayout'
import { useGeneralStatus, ViewModeType } from '../../lib/generalStatus'
import { useRouter } from '../../lib/router'
import TutorialsNoteList from './TutorialsNoteList'
import TutorialsNoteDetail from './TutorialsNoteDetail'
import { useTranslation } from 'react-i18next'

interface TutorialsPageProps {
  pathname: string
}

type TutoriasPagePicker = {
  parentTree?: TutorialsNavigatorTreeItem
  currentTree: TutorialsNavigatorTreeItem
}

export default ({ pathname }: TutorialsPageProps) => {
  const { generalStatus, setGeneralStatus } = useGeneralStatus()
  const router = useRouter()
  const { t } = useTranslation()
  const searchThroughTreeForIdenticalNode = useCallback(
    (
      pathToSearch: string,
      parentDepthPath: string,
      parentAbsolutePath: string,
      tree: TutorialsNavigatorTreeItem,
      parentTree?: TutorialsNavigatorTreeItem
    ): TutoriasPagePicker | null => {
      let match = null
      const currentDepthPath = `${parentDepthPath}/${
        tree.type === 'note' ? 'notes/note:' : ''
      }${tree.slug}`

      const currentAbsolutePath = parentAbsolutePath + '/' + tree.absolutePath
      if (currentDepthPath === pathToSearch) {
        const currentTreeWithDepthAbsolutePath = {
          ...tree,
          absolutePath: currentAbsolutePath,
          children: Object.entries(tree.children).map(obj => {
            return {
              ...obj[1],
              absolutePath: currentAbsolutePath + '/' + obj[1].absolutePath
            }
          }) as TutorialsNavigatorTreeItem[]
        }

        const parentTreeWithDepthAbsolutePath =
          parentTree != null
            ? {
                ...parentTree,
                absolutePath: parentAbsolutePath,
                children: Object.entries(parentTree.children).map(obj => {
                  return {
                    ...obj[1],
                    absolutePath: parentAbsolutePath + '/' + obj[1].absolutePath
                  }
                })
              }
            : undefined

        return {
          currentTree: currentTreeWithDepthAbsolutePath,
          parentTree: parentTreeWithDepthAbsolutePath
        }
      }

      for (let i = 0; i < tree.children.length; i++) {
        match = searchThroughTreeForIdenticalNode(
          pathToSearch,
          currentDepthPath,
          currentAbsolutePath,
          tree.children[i],
          tree
        )
        if (match != null) {
          break
        }
      }

      return match
    },
    []
  )

  const currentTutorialBranch = useMemo(() => {
    let match = null
    for (let i = 0; i < tutorialsTree.length; i++) {
      match = searchThroughTreeForIdenticalNode(
        pathname,
        '/app',
        '',
        tutorialsTree[i]
      )
      if (match != null) {
        break
      }
    }
    return match
  }, [pathname, searchThroughTreeForIdenticalNode])

  const updateNoteListWidth = useCallback(
    (leftWidth: number) => {
      setGeneralStatus({
        noteListWidth: leftWidth
      })
    },
    [setGeneralStatus]
  )

  const toggleViewMode = useCallback(
    (newMode: ViewModeType) => {
      setGeneralStatus({
        noteViewMode: newMode
      })
    },
    [setGeneralStatus]
  )

  const selectedNote = useMemo((): TutorialsNavigatorTreeItem | undefined => {
    if (currentTutorialBranch == null) {
      return undefined
    }

    if (currentTutorialBranch.currentTree.type === 'note') {
      return currentTutorialBranch.currentTree
    }

    const notesChildren = currentTutorialBranch.currentTree.children.filter(
      node => node.type === 'note'
    )
    if (notesChildren.length > 0) {
      return notesChildren[0]
    }
    return undefined
  }, [currentTutorialBranch])

  const currentFolderPathname = useMemo(() => {
    return pathname.split('/notes')[0]
  }, [pathname])

  const navigateUp = useCallback(() => {
    if (currentTutorialBranch == null) {
      return
    }

    if (selectedNote == null) {
      return
    }

    const notes =
      currentTutorialBranch.currentTree.type !== 'note'
        ? currentTutorialBranch.currentTree.children.filter(
            node => node.type === 'note'
          )
        : currentTutorialBranch.parentTree != null
        ? currentTutorialBranch.parentTree.children.filter(
            node => node.type === 'note'
          )
        : []

    if (notes.length < 1) {
      return
    }

    let currentNoteIndex = 0
    for (let i = 0; i < notes.length; i++) {
      if (selectedNote.absolutePath === notes[i].absolutePath) {
        currentNoteIndex = i
        break
      }
    }

    if (currentNoteIndex - 1 >= 0) {
      router.push(
        currentFolderPathname +
          '/notes/note:' +
          notes[currentNoteIndex - 1].slug
      )
    }
    return
  }, [selectedNote, currentTutorialBranch, router, currentFolderPathname])

  const navigateDown = useCallback(() => {
    if (currentTutorialBranch == null) {
      return
    }

    if (selectedNote == null) {
      return
    }

    const notes =
      currentTutorialBranch.currentTree.type !== 'note'
        ? currentTutorialBranch.currentTree.children.filter(
            node => node.type === 'note'
          )
        : currentTutorialBranch.parentTree != null
        ? currentTutorialBranch.parentTree.children.filter(
            node => node.type === 'note'
          )
        : []

    if (notes.length < 1) {
      return
    }

    let currentNoteIndex = 0
    for (let i = 0; i < notes.length; i++) {
      if (selectedNote.absolutePath === notes[i].absolutePath) {
        currentNoteIndex = i
        break
      }
    }

    if (currentNoteIndex + 1 >= 0 && currentNoteIndex + 1 < notes.length) {
      router.push(
        currentFolderPathname +
          '/notes/note:' +
          notes[currentNoteIndex + 1].slug
      )
    }
    return
  }, [selectedNote, currentFolderPathname, currentTutorialBranch, router])

  return (
    <TwoPaneLayout
      style={{ height: '100%' }}
      defaultLeftWidth={generalStatus.noteListWidth}
      left={
        currentTutorialBranch != null && (
          <TutorialsNoteList
            navigateDown={navigateDown}
            navigateUp={navigateUp}
            currentTree={currentTutorialBranch.currentTree}
            parentTree={currentTutorialBranch.parentTree}
            basePathname={currentFolderPathname}
            selectedNote={selectedNote}
          />
        )
      }
      right={
        selectedNote == null ? (
          <div>{t('note.unselect')}</div>
        ) : (
          <TutorialsNoteDetail
            note={selectedNote}
            viewMode={generalStatus.noteViewMode}
            toggleViewMode={toggleViewMode}
          />
        )
      }
      onResizeEnd={updateNoteListWidth}
    />
  )
}
