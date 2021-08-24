import React from 'react'
import { SerializedTeam } from '../../../../cloud/interfaces/db/team'
import RoundedImage from '../../../../design/components/atoms/RoundedImage'
import styled from '../../../../design/lib/styled'
import { buildIconUrl } from '../../../../cloud/api/files'
import { boostHubBaseUrl } from '../../../../cloud/lib/consts'

interface SpaceMenuItemLabelProps {
  team: SerializedTeam
}

const SpaceMenuItemLabel = ({ team }: SpaceMenuItemLabelProps) => {
  const iconLocation = team.icon?.location

  return (
    <Container>
      <RoundedImage
        className='space-menu-item-label__icon'
        url={
          iconLocation != null
            ? `${boostHubBaseUrl}${buildIconUrl(iconLocation)}`
            : undefined
        }
        size={22}
        alt={team.name}
      />
      <div className='space-menu-item-label__name'>{team.name}</div>
    </Container>
  )
}

export default SpaceMenuItemLabel

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;

  .space-menu-item-label__icon {
    text-align: center;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .space-menu-item-label__name {
  }
`
