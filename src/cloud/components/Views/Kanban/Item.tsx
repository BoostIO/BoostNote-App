import { mdiFileDocumentOutline } from '@mdi/js'
import React from 'react'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { getDocTitle } from '../../../lib/utils/patterns'

interface ItemProps {
  doc: SerializedDocWithSupplemental
  onClick?: (doc: SerializedDocWithSupplemental) => void
}

const Item = ({ doc, onClick }: ItemProps) => {
  return (
    <Container
      labelClick={() => onClick && onClick(doc)}
      label={getDocTitle(doc, 'Untitled')}
      icon={
        doc.emoji != null
          ? { type: 'emoji', path: doc.emoji }
          : { type: 'icon', path: mdiFileDocumentOutline }
      }
    />
  )
}

const Container = styled(NavigationItem)`
  padding: ${({ theme }) => theme.sizes.spaces.sm}px !important;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  height: 32px !important;

  .navigation__item__label {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px !important;
  }
`

export default Item
