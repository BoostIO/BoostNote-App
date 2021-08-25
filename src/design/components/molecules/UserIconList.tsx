import React, { useMemo, useState } from 'react'
import RoundedImage, { RoundedImageProps } from '../atoms/RoundedImage'
import cc from 'classcat'
import styled from '../../lib/styled'
import WithTooltip from '../atoms/WithTooltip'
import Button from '../atoms/Button'
import { overflowEllipsis } from '../../lib/styled/styleFunctions'

interface UserIconListProps {
  className?: string
  users: (RoundedImageProps & { tooltip?: string; color?: string })[]
  subtleBorders?: boolean
  hideBorders?: boolean
  expand?: boolean
  limit?: number
}

const UserIconList = ({
  className,
  users,
  limit,
  expand,
  hideBorders,
  subtleBorders,
}: UserIconListProps) => {
  const [expanded, setExpanded] = useState(false)
  const content = useMemo(() => {
    if (limit == null || expanded) {
      return {
        rows: users,
      }
    }

    return {
      rows: users.slice(0, limit),
      sliced: users.length - limit,
    }
  }, [expanded, users, limit])

  if (content.rows.length == 0) {
    return null
  }

  return (
    <Container
      className={cc([
        'rounded__image__list',
        expanded && 'rounded__image__list--expanded',
        hideBorders && 'rounded__image__list__borders--none',
        subtleBorders && 'rounded__image__list__borders--subtle',
        className,
      ])}
    >
      <div className='rounded__image__wrapper'>
        {content.rows.map((row, i) => (
          <WithTooltip tooltip={row.tooltip} key={i}>
            <RoundedImage
              className='rounded__image'
              url={row.url}
              alt={row.alt}
              size={row.size}
              rounded={true}
              color={row.color}
            />
          </WithTooltip>
        ))}
      </div>
      {expand && content.rows.length !== users.length ? (
        <Button
          variant='icon'
          size='sm'
          className='rounded__image__expand'
          onClick={() => setExpanded((prev) => !prev)}
        >
          {content.sliced != null ? `+${content.sliced}` : '-'}
        </Button>
      ) : null}
    </Container>
  )
}

const Container = styled.div`
  &:not(.rounded__image__list__borders--none) .rounded__image {
    border: 2px solid transparent;
  }

  &.rounded__image__list__borders--subtle .rounded__image {
    border-color: ${({ theme }) => theme.colors.border.second} !important;
  }

  &.rounded__image__list,
  .rounded__image__wrapper {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  &.rounded__image__list--expanded .rounded__image__wrapper {
    flex-wrap: wrap;
  }

  .rounded__image__wrapper {
    flex: 1 1 5px;
    ${overflowEllipsis}
  }

  .rounded__image + .rounded__image {
    margin-left: -3px;
  }

  .rounded__image__expand {
    flex: 0 0 auto;
  }
`

export default UserIconList
