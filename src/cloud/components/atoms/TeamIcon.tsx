import React from 'react'
import { SerializedTeam } from '../../interfaces/db/team'
import { buildIconUrl } from '../../api/files'
import styled from '../../lib/styled'

interface TeamIconProps {
  team?: SerializedTeam
}

const TeamIcon = ({ team }: TeamIconProps) => {
  if (team == null) {
    return (
      <StyledFillerIcon>
        <span className='wrapper'>?</span>
      </StyledFillerIcon>
    )
  }

  if (team.icon == null) {
    return (
      <StyledFillerIcon>
        <span className='wrapper'>{team.name.substr(0, 2)}</span>
      </StyledFillerIcon>
    )
  }

  return <StyledImg src={buildIconUrl(team.icon.location)} />
}

const StyledFillerIcon = styled.div`
  text-transform: capitalize;
  background: #000;
  color: #fff;
  width: 100%;
  height: 100%;
  font-weight: bold;
  display: table;
  vertical-align: middle;

  .wrapper {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    margin: auto;
    line-height: ${({ theme }) => theme.fontSizes.xsmall}px;
    width: 100%;
    height: 100%;
  }
`

const StyledImg = styled.img`
  object-fit: cover;
`

export default TeamIcon
