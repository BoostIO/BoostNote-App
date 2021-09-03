import React from 'react'
import { ViewProps } from '.'
import AspectRatio from '../../../../design/components/atoms/AspectRation'
import styled from '../../../../design/lib/styled'
import { EmbedBlock } from '../../../api/blocks'

const EmbedView = ({ block, isChild }: ViewProps<EmbedBlock>) => {
  if (isChild) {
    return (
      <AspectRatio width={16} height={9}>
        <StyledEmbedView>
          <iframe src={block.data.url} allowFullScreen={true}></iframe>
        </StyledEmbedView>
      </AspectRatio>
    )
  }
  return (
    <StyledEmbedView>
      <iframe src={block.data.url} allowFullScreen={true}></iframe>
    </StyledEmbedView>
  )
}

const StyledEmbedView = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  & iframe {
    height: 100%;
    width: 100%;
  }
`

export default EmbedView
