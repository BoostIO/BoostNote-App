import React, { useEffect, useMemo } from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { getDocTitle } from '../../lib/utils/patterns'
import { useNav } from '../../lib/stores/nav'
import { useTitle } from 'react-use'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
} from '../../lib/keyboard'
import { getDocLinkHref } from '../Link/DocLink'
import { shortcuts, isDocDeleteShortcut } from '../../lib/shortcuts'
import { useGlobalData } from '../../lib/stores/globalData'
import {
  SerializedDocWithSupplemental,
  SerializedDoc,
} from '../../interfaces/db/doc'
import { SerializedUser } from '../../interfaces/db/user'
import { SerializedRevision } from '../../interfaces/db/revision'
import { useRouter } from '../../lib/router'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import Editor from '../Editor'
import ApplicationPage from '../ApplicationPage'
import BlockEditor from '../Blocks/BlockEditor'
import { freePlanMembersLimit } from '../../lib/subscription'
import Spinner from '../../../design/components/atoms/Spinner'

interface DocPageProps {
  doc: SerializedDocWithSupplemental
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  revisionHistory: SerializedRevision[]
  thread?: string
  loading?: boolean
}

const DocPage = ({
  doc,
  contributors,
  backLinks,
  revisionHistory,
  loading = false,
}: DocPageProps) => {
  const {
    team,
    subscription,
    permissions = [],
    currentUserPermissions,
    currentUserIsCoreMember,
    pageData,
  } = usePage()
  const { docsMap, setCurrentPath, deleteDocHandler } = useNav()
  const {
    globalData: { currentUser },
  } = useGlobalData()
  const router = useRouter()

  const currentDoc = useMemo(() => {
    const mapDoc = docsMap.get(doc.id)
    if (mapDoc != null && doc.collaborationToken != null) {
      mapDoc.collaborationToken = doc.collaborationToken
    }
    // FIXME: docsMap should be updated before rendering DocPage
    if (mapDoc == null) {
      return doc
    }
    return mapDoc
  }, [docsMap, doc])

  const pageTitle = useMemo(() => {
    if (currentDoc == null || team == null) {
      return 'BoostHub'
    }

    return `${getDocTitle(currentDoc, 'Untitled..')} - ${team.name}`
  }, [currentDoc, team])

  useTitle(pageTitle)

  useEffect(() => {
    if (currentDoc == null) {
      setCurrentPath('/')
      return
    } else {
      setCurrentPath(currentDoc.folderPathname)
    }
  }, [currentDoc, setCurrentPath])

  const docIsEditable = useMemo(() => {
    if (
      currentUserPermissions == null ||
      currentUserPermissions.role === 'viewer'
    ) {
      return false
    }

    if (
      subscription == null &&
      permissions.filter((p) => p.role !== 'viewer').length <=
        freePlanMembersLimit
    ) {
      return true
    }

    if (
      subscription != null &&
      subscription.seats >=
        permissions.filter((p) => p.role !== 'viewer').length
    ) {
      return true
    }

    return false
  }, [subscription, permissions, currentUserPermissions])

  const docPageControlsKeyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (currentDoc == null || !currentUserIsCoreMember) {
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
  }, [
    deleteDocHandler,
    currentDoc,
    docIsEditable,
    router,
    team,
    currentUserIsCoreMember,
  ])
  useGlobalKeyDownHandler(docPageControlsKeyDownHandler)

  if (currentDoc == null || team == null) {
    if ((pageData as any).needsReload != null) {
      return (
        <ApplicationPage showingTopbarPlaceholder={true}>
          <Spinner variant='subtle' style={{ marginLeft: 15, marginTop: 15 }} />
        </ApplicationPage>
      )
    }
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ColoredBlock
          variant='danger'
          style={{
            width: '96%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '100px',
          }}
        >
          <h3>Oops...</h3>
          <p>The document has been deleted.</p>
        </ColoredBlock>
      </ApplicationPage>
    )
  }

  if (currentUser == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ColoredBlock
          variant='danger'
          style={{
            width: '96%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '100px',
          }}
        >
          <h3>Oops...</h3>
          <p>You need to be connected to access this document.</p>
        </ColoredBlock>
      </ApplicationPage>
    )
  }

  return currentDoc.rootBlock == null ? (
    <Editor
      team={team}
      doc={currentDoc}
      user={currentUser}
      contributors={contributors}
      backLinks={backLinks}
      revisionHistory={revisionHistory}
      docIsEditable={docIsEditable}
      loading={loading}
    />
  ) : (
    <BlockEditor doc={currentDoc as any} team={team} />
  )
}

export default DocPage
