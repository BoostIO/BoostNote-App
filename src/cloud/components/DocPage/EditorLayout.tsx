import React, { PropsWithChildren } from 'react'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import DocPageHeader from './DocPageHeader'
import cc from 'classcat'
import { SerializedTeam } from '../../interfaces/db/team'
import Scroller from '../../../design/components/atoms/Scroller'

interface EditorLayoutProps {
  docIsEditable: boolean
  doc: SerializedDocWithSupplemental
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
        <Scroller className='editor__layout__scroll'>
          <DocPageHeader
            className='editor__layout__header'
            docIsEditable={docIsEditable}
            doc={doc}
            team={team}
          />
          <div className='editor__layout__content'>{children}</div>
        </Scroller>
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
    overflow: visible;
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
