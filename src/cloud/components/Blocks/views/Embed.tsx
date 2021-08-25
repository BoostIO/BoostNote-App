import React from 'react'
import styled from '../../../../design/lib/styled'
import { EmbedBlock } from '../../../api/blocks'
import { ViewProps } from '../BlockContent'

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
