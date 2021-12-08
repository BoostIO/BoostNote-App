import { mdiFileDocumentOutline } from '@mdi/js'
import React from 'react'
import Icon from '../../../../design/components/atoms/Icon'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { getDocTitle } from '../../../lib/utils/patterns'

interface ItemProps {
  doc: SerializedDocWithSupplemental
}

const Item = ({ doc }: ItemProps) => {
  return (
    <Container>
      <Icon path={mdiFileDocumentOutline} />
      <span>{getDocTitle(doc)}</span>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`

export default Item
