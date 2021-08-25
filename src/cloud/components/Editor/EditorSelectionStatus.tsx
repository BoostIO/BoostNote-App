import React from 'react'
import styled from '../../../design/lib/styled'
import { EditorPosition } from '../../lib/editor/CodeMirror'

interface EditorSelectionStatusProps {
  cursor: EditorPosition
  selections: {
    head: EditorPosition
    anchor: EditorPosition
  }[]
}

const EditorSelectionStatus = ({
  cursor,
  selections,
}: EditorSelectionStatusProps) => {
  return (
    <Container>
      Line {cursor.line + 1} / Col {cursor.ch + 1}
      {selections.length > 1 ? (
        <> - Selected {selections.length} ranges</>
      ) : selections[0].head.line !== selections[0].anchor.line ? (
        <>
          {' '}
          - Selected{' '}
          {Math.abs(selections[0].head.line - selections[0].anchor.line) +
            1}{' '}
          lines
        </>
      ) : selections[0].head.ch !== selections[0].anchor.ch ? (
        <>
          {' '}
          - Selected {Math.abs(
            selections[0].head.ch - selections[0].anchor.ch
          )}{' '}
          char(s)
        </>
      ) : null}
    </Container>
  )
}

export default EditorSelectionStatus

const Container = styled.div`
  padding: 0 5px;
  height: 24px;
  user-select: none;

  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  color: ${({ theme }) => theme.colors.text.subtle};
`
