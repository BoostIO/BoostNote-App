import React from 'react'
import styled from '../../../lib/v2/styled'

interface RoundedImageProps {
  url?: string
  alt: string
  size?: 'sm' | 'default'
}

const RoundedImage = ({ url, alt, size = 'default' }: RoundedImageProps) => {
  if (url == null) {
    return (
      <StyledFillerIcon className={`size__${size}`}>
        <span className='wrapper'>{alt.substr(0, 2)}</span>
      </StyledFillerIcon>
    )
  }

  return <StyledImg className={`size__${size}`} src={url} alt={alt} />
}

const StyledFillerIcon = styled.div`
  text-transform: capitalize;
  background: #000;
  color: #fff;
  font-weight: bold;
  display: table;
  vertical-align: middle;
  border-radius: ${({ theme }) => theme.borders.radius}px;

  &.size__sm {
    width: 22px;
    height: 22px;
  }

  &.size__default {
    width: 30px;
    height: 30px;
  }

  .wrapper {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    margin: auto;
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    width: 100%;
    height: 100%;
  }
`

const StyledImg = styled.img`
  object-fit: cover;
  width: 22px;
  height: 22px;
`

export default RoundedImage
