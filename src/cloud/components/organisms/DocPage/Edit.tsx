import React from 'react'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
} from '../../../interfaces/db/doc'
import Editor from '../../molecules/Editor'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedUser } from '../../../interfaces/db/user'
import styled from '../../../lib/styled'
import { rightSideTopBarHeight } from '../RightSideTopBar/styled'
import { SerializedRevision } from '../../../interfaces/db/revision'

interface EditPageProps {
  doc: SerializedDocWithBookmark
  team: SerializedTeam
  user: SerializedUser
  contributors: SerializedUser[]
  revisionHistory: SerializedRevision[]
  backLinks: SerializedDoc[]
  thread?: string
}

const EditPage = ({
  doc,
  team,
  user,
  contributors,
  revisionHistory,
  backLinks,
  thread,
}: EditPageProps) => {
  return (
    <StyledDocEditPage>
      <Editor
        team={team}
        doc={doc}
        user={user}
        contributors={contributors}
        backLinks={backLinks}
        revisionHistory={revisionHistory}
        thread={thread}
      />
    </StyledDocEditPage>
  )
}

const StyledDocEditPage = styled.div`
  margin: 0;
  padding: 0;
  padding-top: ${rightSideTopBarHeight}px;
  min-height: calc(100vh - ${rightSideTopBarHeight}px);
  height: auto;
  display: flex;

  .cm-link {
    text-decoration: none;
  }
`

export default EditPage
