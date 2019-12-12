import React from 'react'
import styled from './styled'

const HighlightContainer = styled.span`
  .highlighted {
    background: rgba(3, 197, 136, 0.6);
  }
`

interface GetHighlightedTextProps {
  text: string
  search: string
}

function GetHighlightedText(props: GetHighlightedTextProps) {
  const { text, search } = props
  if (search.trim() === '') return <>{text}</>
  const searchRegex = new RegExp(`(${search})`, 'gi')
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
}

export default GetHighlightedText
