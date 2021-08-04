import React from 'react'
import { ViewProps } from '../BlockContent'
import { EmbedBlock } from '../../../../api/blocks'
import styled from '../../../../lib/styled'

const EmbedView = ({ block }: ViewProps<EmbedBlock>) => {
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
