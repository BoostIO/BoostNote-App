import React, { useMemo } from 'react'
import styled from '../../lib/styled'
import { escapeRegExp } from '../../lib/regex'

const HighlightContainer = styled.span`
  .highlighted {
    background: rgba(3, 197, 136, 0.6);
  }
`

interface HighlightTextProps {
  text: string
  search: string
}

function HighlightText(props: HighlightTextProps) {
  const { text, search } = props
  return useMemo(() => {
    if (search.trim() === '') return <>{text}</>
    const searchRegex = new RegExp(`(${escapeRegExp(search)})`, 'gi')
    const parts = text.split(searchRegex)

    return (
      <HighlightContainer>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <span key={i} className='highlighted'>
              {part}
            </span>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </HighlightContainer>
    )
  }, [text, search])
}

export default HighlightText
