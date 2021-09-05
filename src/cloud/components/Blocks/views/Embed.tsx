import { mdiTrashCanOutline } from '@mdi/js'
import React from 'react'
import { ViewProps } from '.'
import AspectRatio from '../../../../design/components/atoms/AspectRation'
import styled from '../../../../design/lib/styled'
import { EmbedBlock } from '../../../api/blocks'
import { getBlockDomId } from '../../../lib/blocks/dom'
import BlockLayout from '../BlockLayout'

const EmbedView = ({
  block,
  isChild,
  actions,
  currentUserIsCoreMember,
}: ViewProps<EmbedBlock>) => {
  if (isChild) {
    return (
      <BlockLayout
        controls={
          currentUserIsCoreMember
            ? [
                {
                  iconPath: mdiTrashCanOutline,
                  onClick: () => actions.remove(block),
                },
              ]
            : undefined
        }
      >
        <AspectRatio width={16} height={9}>
          <StyledEmbedView>
            <iframe src={block.data.url} allowFullScreen={true}></iframe>
          </StyledEmbedView>
        </AspectRatio>
      </BlockLayout>
    )
  }
  return (
    <StyledEmbedView id={getBlockDomId(block)}>
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
