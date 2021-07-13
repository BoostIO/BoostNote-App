import React, { PropsWithChildren } from 'react'
import styled from '../../../../shared/lib/styled'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import DocPageHeader from './DocPageHeader'
import cc from 'classcat'
import { SerializedTeam } from '../../../interfaces/db/team'
import VerticalScroller from '../../../../shared/components/atoms/VerticalScroller'

interface EditorLayoutProps {
  docIsEditable: boolean
  doc: SerializedDocWithBookmark
  fullWidth: boolean
  team: SerializedTeam
}

const EditorLayout = ({
  docIsEditable,
  doc,
  fullWidth,
  team,
  children,
}: PropsWithChildren<EditorLayoutProps>) => {
  if (!fullWidth) {
    return (
      <Container
        className={cc(['editor__layout', 'editor__layout--minimized'])}
      >
        <VerticalScroller className='editor__layout__scroll'>
          <DocPageHeader
            className='editor__layout__header'
            docIsEditable={docIsEditable}
            doc={doc}
            team={team}
          />
          <div className='editor__layout__content'>{children}</div>
        </VerticalScroller>
      </Container>
    )
  }

  return (
    <Container className={cc(['editor__layout'])}>
      <DocPageHeader
        className='editor__layout__header'
        docIsEditable={docIsEditable}
        doc={doc}
        team={team}
      />
      <div className='editor__layout__content'>{children}</div>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .editor__layout__header {
    flex: 0 0 auto;
  }

  .editor__layout__content {
    flex: 1 1 auto;
    overflow-y: auto;
    height: 0px;
  }

  &:not(.editor__layout--minimized) {
    .editor__layout__header {
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
      .doc__page__padding {
        border: 0;
      }
    }
  }

  &.editor__layout--minimized {
    .editor__layout__scroll {
      height: 100%;
      width: 100%;
    }

    .editor__layout__header {
      max-width: 920px;
      margin: auto;
      height: auto;
    }

    .editor__layout__content {
      max-width: 920px;
      width: 100%;
      margin: auto;
      height: auto;
    }
  }
`

export default React.memo(EditorLayout)
