import React, { useMemo, useState } from 'react'
import RoundedImage, { RoundedImageProps } from '../atoms/RoundedImage'
import cc from 'classcat'
import styled from '../../../lib/v2/styled'
import WithTooltip from '../atoms/WithTooltip'
import Button from '../atoms/Button'
import { overflowEllipsis } from '../../../lib/v2/styled/styleFunctions'

interface RoundedImageListProps {
  className?: string
  images: (RoundedImageProps & { tooltip?: string })[]
  expand?: boolean
  limit?: number
}

const RoundedImageList = ({
  className,
  images,
  limit,
  expand,
}: RoundedImageListProps) => {
  const [expanded, setExpanded] = useState(false)
  const content = useMemo(() => {
    if (limit == null || expanded) {
      return {
        rows: images,
      }
    }

    return {
      rows: images.slice(0, limit),
      sliced: images.length - limit,
    }
  }, [expanded, images, limit])

  if (content.rows.length == 0) {
    return null
  }

  return (
    <Container
      className={cc([
        'rounded__image__list',
        expanded && 'rounded__image__list--expanded',
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
            />
          </WithTooltip>
        ))}
      </div>
      {expand && content.rows.length !== images.length ? (
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

  .rounded__image {
    margin-left: -3px;
  }

  .rounded__image__expand {
    flex: 0 0 auto;
  }
`

export default RoundedImageList
