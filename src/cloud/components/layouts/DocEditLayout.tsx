import React from 'react'
import styled from '../../lib/styled'

export type LayoutMode = 'split' | 'preview' | 'editor'

interface DocEditLayoutProps {
  title: React.ReactNode
  actionBar: React.ReactNode
  editor: React.ReactNode
  preview: React.ReactNode
  before?: React.ReactNode
  mode: 'split' | 'preview' | 'editor'
}

const DocEditLayout = ({
  title,
  actionBar,
  editor,
  mode,
  preview,
  before,
}: DocEditLayoutProps) => {
  return (
    <>
      <StyledEditorHead>
        {title}
        {actionBar}
      </StyledEditorHead>
      {before}
      <StyledEditor>
        <StyledEditorWrapper className={`layout-${mode}`}>
          {editor}
        </StyledEditorWrapper>
        {(mode === 'preview' || mode === 'split') && (
          <StyledPreview className={`layout-${mode}`}>{preview}</StyledPreview>
        )}
      </StyledEditor>
    </>
  )
}

const StyledEditorHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${({ theme }) => theme.space.small}px 0;
`

const StyledEditorWrapper = styled.div`
  height: auto;
  width: 50%;
  border-right: 1px solid ${({ theme }) => theme.baseBorderColor};
  margin-right: 5px;

  &.layout-editor {
    width: 100%;
  }

  &.layout-preview {
    display: none;
  }
`

const StyledPreview = styled.div`
  height: 100%;
  overflow: auto;
  width: 50%;

  &.layout-split {
    width: 50%;
  }

  &.layout-preview {
    width: 100%;
  }
`

const StyledEditor = styled.div`
  position: relative;
  width: 100%;
  top: 0;
  bottom: 0px;

  display: flex;
  min-height: 0;
  height: auto;
  flex-grow: 1;

  & .CodeMirrorWrapper {
    height: 100%;
    word-break: break-word;
  }

  & .CodeMirror {
    width: 100%;
    height: 100%;
    & .remote-caret {
      position: relative;
      border: 1px solid;
      & > div {
        display: none;
      }
    }
  }

  .CodeMirror-scroll {
    position: relative;
    z-index: 0;
  }

  & .file-loading-widget {
    transform: translate3d(0, -100%, 0);
  }
`
export default DocEditLayout
