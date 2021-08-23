import React from 'react'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
} from '../../interfaces/db/doc'
import Editor from '../Editor'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedUser } from '../../interfaces/db/user'
import { SerializedRevision } from '../../interfaces/db/revision'
import styled from '../../../design/lib/styled'
import { rightSideTopBarHeight } from '../../../design/components/organisms/Topbar'

interface EditPageProps {
  doc: SerializedDocWithBookmark
  team: SerializedTeam
  user: SerializedUser
  contributors: SerializedUser[]
  revisionHistory: SerializedRevision[]
  backLinks: SerializedDoc[]
}

const EditPage = ({
  doc,
  team,
  user,
  contributors,
  revisionHistory,
  backLinks,
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
