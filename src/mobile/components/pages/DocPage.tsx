import React, { useEffect, useMemo } from 'react'
import { usePage } from '../../../cloud/lib/stores/pageStore'
import { getDocTitle } from '../../../cloud/lib/utils/patterns'
import { useNav } from '../../../cloud/lib/stores/nav'
import DocEditPage from './DocEditPage'
import DocViewPage from './DocViewPage'
import { useTitle } from 'react-use'
import { useGlobalData } from '../../../cloud/lib/stores/globalData'
import {
  SerializedDocWithSupplemental,
  SerializedDoc,
} from '../../../cloud/interfaces/db/doc'
import { SerializedUser } from '../../../cloud/interfaces/db/user'
import { SerializedRevision } from '../../../cloud/interfaces/db/revision'
import AppLayout from '../layouts/AppLayout'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import { freePlanMembersLimit } from '../../../cloud/lib/subscription'

interface DocPageProps {
  doc: SerializedDocWithSupplemental
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  revisionHistory: SerializedRevision[]
}

const DocPage = ({ doc, contributors, backLinks }: DocPageProps) => {
  const {
    team,
    subscription,
    permissions = [],
    currentUserPermissions,
  } = usePage()
  const { docsMap, setCurrentPath } = useNav()
  const {
    globalData: { currentUser },
  } = useGlobalData()

  const currentDoc = useMemo(() => {
    const mapDoc = docsMap.get(doc.id)
    if (mapDoc != null && doc.collaborationToken != null) {
      mapDoc.collaborationToken = doc.collaborationToken
    }
    return mapDoc
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

  if (currentDoc == null || team == null) {
    return (
      <AppLayout>
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
      </AppLayout>
    )
  }

  if (currentUser == null) {
    return (
      <AppLayout>
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
      </AppLayout>
    )
  }

  return docIsEditable ? (
    <DocEditPage
      team={team}
      doc={currentDoc}
      user={currentUser}
      contributors={contributors}
      backLinks={backLinks}
      subscription={subscription}
    />
  ) : (
    <DocViewPage
      team={team}
      doc={currentDoc}
      contributors={contributors}
      backLinks={currentBacklinks}
      user={currentUser}
    />
  )
}

export default DocPage
