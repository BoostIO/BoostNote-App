import { mdiFileDocumentOutline } from '@mdi/js'
import React from 'react'
import Icon from '../../../../design/components/atoms/Icon'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { getDocTitle } from '../../../lib/utils/patterns'

interface ItemProps {
  doc: SerializedDocWithSupplemental
  onClick?: (doc: SerializedDocWithSupplemental) => void
}

const Item = ({ doc, onClick }: ItemProps) => {
  return (
    <Container>
      <Icon path={mdiFileDocumentOutline} />
      <span onClick={() => onClick && onClick(doc)}>{getDocTitle(doc)}</span>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  background-color: ${({ theme }) => theme.colors.background.secondary};

  & > span {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    cursor: pointer;
  }
`

export default Item
