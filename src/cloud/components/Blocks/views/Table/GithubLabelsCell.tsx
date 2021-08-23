import React from 'react'
import styled from '../../../../../design/lib/styled'

interface Label {
  name: string
  color: string
}

interface GithubLabelsCellProps {
  labels: Label[]
}

const GithubLabelsCell = ({ labels }: GithubLabelsCellProps) => {
  return (
    <StyledGithubLabels>
      {labels.map((label) => (
        <span style={{ backgroundColor: `#${label.color}` }}>{label.name}</span>
      ))}
    </StyledGithubLabels>
  )
}

const StyledGithubLabels = styled.div`
  display: flex;
  span {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px;
    border-radius: 5px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  }
`

export default GithubLabelsCell
