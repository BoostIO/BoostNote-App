import React from 'react'
import styled from '../../../lib/v2/styled'
import cc from 'classcat'

export interface RoundedImageProps {
  url?: string
  alt: string
  rounded?: boolean
  size?: 'sm' | 'default'
  className?: string
  color?: string
}

const RoundedImage = ({
  className,
  url,
  alt,
  rounded,
  color,
  size = 'default',
}: RoundedImageProps) => {
  if (url == null) {
    return (
      <StyledFillerIcon
        className={cc([
          'rounded__image',
          `rounded__image__size--${size}`,
          rounded && `rounded__image--rounded`,
          className,
        ])}
        style={{ color: color, borderColor: color }}
      >
        <span className='wrapper'>{alt.substr(0, 2)}</span>
      </StyledFillerIcon>
    )
  }

  return (
    <StyledImg
      className={cc([
        'rounded__image',
        `rounded__image__size--${size}`,
        rounded && `rounded__image--rounded`,
        className,
      ])}
      style={{ color: color, borderColor: color }}
      src={url}
      alt={alt}
    />
  )
}

const StyledFillerIcon = styled.div`
  text-transform: capitalize;
  background: #000;
  color: #fff;
  font-weight: bold;
  display: table;
  vertical-align: middle;
  border-radius: ${({ theme }) => theme.borders.radius}px;

  .wrapper {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    margin: auto;
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    width: 100%;
    height: 100%;
  }

  &.rounded__image--rounded {
    border-radius: 50%;
  }

  &.rounded__image__size--sm {
    width: 22px;
    height: 22px;
  }

  &.rounded__image__size--default {
    width: 30px;
    height: 30px;
  }
`

const StyledImg = styled.img`
  object-fit: cover;
  width: 22px;
  height: 22px;
  border-radius: ${({ theme }) => theme.borders.radius}px;

  &.rounded__image--rounded {
    border-radius: 50%;
  }

  &.rounded__image__size--sm {
    width: 22px;
    height: 22px;
  }

  &.rounded__image__size--default {
    width: 30px;
    height: 30px;
  }
`

export default RoundedImage
