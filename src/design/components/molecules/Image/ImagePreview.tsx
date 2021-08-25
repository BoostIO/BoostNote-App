import React from 'react'
import styled from '../../../lib/styled'
import Image from '../../atoms/Image'

interface ImagePreviewProps {
  src: string
}

const ImagePreview = ({ src }: ImagePreviewProps) => {
  return (
    <Container>
      <Image className={'image__preview_width'} src={src} />
    </Container>
  )
}

const Container = styled.div`
  padding: 20px 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  .image__preview_width {
    max-width: 100%;
  }
`

export default ImagePreview
