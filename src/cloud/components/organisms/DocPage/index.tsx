import React, { useEffect, useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { useRouter } from 'next/router'
import { getTeamURL, getDocURL, getDocTitle } from '../../../lib/utils/patterns'
import { useNav } from '../../../lib/stores/nav'
import ColoredBlock from '../../atoms/ColoredBlock'
import EditPage from './Edit'
import ViewPage from './View'
import { useTitle } from 'react-use'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
} from '../../../lib/keyboard'
import { getDocLinkHref } from '../../atoms/Link/DocLink'
import { shortcuts, isDocDeleteShortcut } from '../../../lib/shortcuts'
import { useGlobalData } from '../../../lib/stores/globalData'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
} from '../../../interfaces/db/doc'
import AppLayout from '../../layouts/AppLayout'
import { SerializedUser } from '../../../interfaces/db/user'
import { SerializedRevision } from '../../../interfaces/db/revision'

interface DocPageProps {
  doc: SerializedDocWithBookmark
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  revisionHistory: SerializedRevision[]
}

const docIdRegex = new RegExp(`(((?:^\/[A-z0-9]*-)([A-z0-9]*)$)|([A-z0-9]*)$)`)

const DocPage = ({
  doc,
  contributors,
  backLinks,
  revisionHistory,
}: DocPageProps) => {
  const { team, subscription, permissions = [] } = usePage()
  const { docsMap, setCurrentPath, deleteDocHandler } = useNav()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const router = useRouter()

  const currentDoc = useMemo(() => {
    return docsMap.get(doc.id)
  }, [docsMap, doc])

  const currentBacklinks = useMemo(() => {
    return backLinks.map((doc) => docsMap.get(doc.id) || doc)
  }, [docsMap, backLinks])

  const pageTitle = useMemo(() => {
    if (currentDoc == null || team == null) {
      return 'BoostHub'
    }

    return `${getDocTitle(currentDoc, 'Untitled..')} - ${team.name}`
  }, [currentDoc, team])

  useTitle(pageTitle)

  useEffect(() => {
    if (currentDoc == null) {
      return
    }
  }, [currentDoc])

  useEffect(() => {
    if (currentDoc == null) {
      setCurrentPath('/')
      return
    } else {
      setCurrentPath(currentDoc.folderPathname)
    }
  }, [currentDoc, setCurrentPath])

  const currentAsPath = useMemo(() => {
    if (team == null) {
      return '/'
    }

    if (currentDoc == null) {
      return getTeamURL(team)
    } else {
      return `${getTeamURL(team)}${getDocURL(currentDoc)}`
    }
  }, [team, currentDoc])

  useEffect(() => {
    if (router.asPath === currentAsPath) {
      return
    }

    const prevPathMatch = router.asPath.match(docIdRegex)
    const currentPathMatch = currentAsPath.match(docIdRegex)
    if (
      prevPathMatch == null ||
      currentPathMatch == null ||
      prevPathMatch[1] !== currentPathMatch[1]
    ) {
      return
    }
    router.replace('/[teamId]/[resourceId]', currentAsPath, {
      shallow: true,
    })
  }, [currentAsPath, router, setCurrentPath])

  const docIsEditable = useMemo(() => {
    if (subscription == null) {
      return true
    }

    if (subscription.seats >= permissions.length) {
      return true
    }

    return false
  }, [subscription, permissions])

  const docPageControlsKeyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (currentDoc == null) {
        return
      }
      if (isDocDeleteShortcut(event) && currentDoc.archivedAt != null) {
        preventKeyboardEventPropagation(event)
        deleteDocHandler(currentDoc)
      }
      if (
        isSingleKeyEventOutsideOfInput(event, shortcuts.editDoc) &&
        docIsEditable
      ) {
        if (team == null) {
          return
        }
        preventKeyboardEventPropagation(event)
        router.push(getDocLinkHref(currentDoc, team, 'index'))
      }
    }
  }, [deleteDocHandler, currentDoc, docIsEditable, router, team])
  useGlobalKeyDownHandler(docPageControlsKeyDownHandler)

  if (currentDoc == null || team == null) {
    return (
      <AppLayout rightLayout={{}}>
        <ColoredBlock variant='danger' style={{ marginTop: '100px' }}>
          <h3>Oops...</h3>
          <p>The document has been deleted.</p>
        </ColoredBlock>
      </AppLayout>
    )
  }

  return docIsEditable &&
    currentDoc.archivedAt == null &&
    currentUser != null ? (
    <EditPage
      team={team}
      doc={currentDoc}
      user={currentUser}
      contributors={contributors}
      backLinks={currentBacklinks}
      revisionHistory={revisionHistory}
    />
  ) : (
    <ViewPage
      team={team}
      doc={currentDoc}
      editable={docIsEditable}
      contributors={contributors}
      backLinks={currentBacklinks}
    />
  )
}

export default DocPage
