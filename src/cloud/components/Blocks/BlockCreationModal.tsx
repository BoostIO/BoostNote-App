import { mdiCodeTags, mdiFileDocumentOutline, mdiTable } from '@mdi/js'
import React from 'react'
import Button from '../../../design/components/atoms/Button'
import Icon from '../../../design/components/atoms/Icon'
import LeftRightList from '../../../design/components/atoms/LeftRightList'
import styled from '../../../design/lib/styled'

interface BlockCreationModalProps {
  onMarkdownCreation?: () => void
  onTableCreation?: () => void
  onEmbedCreation?: () => void
}

const BlockCreationModal = ({
  onMarkdownCreation,
  onEmbedCreation,
  onTableCreation,
}: BlockCreationModalProps) => (
  <Container>
    <LeftRightList className='block__creation__list'>
      {onMarkdownCreation != null && (
        <Button
          variant='transparent'
          id='block__creation__markdown'
          onClick={onMarkdownCreation}
          className='block__view__add__selector'
        >
          <Icon size={50} path={mdiFileDocumentOutline} />
          <span>Markdown</span>
        </Button>
      )}
      {onTableCreation != null && (
        <Button
          id='block__creation__table'
          variant='transparent'
          onClick={onTableCreation}
          className='block__view__add__selector'
        >
          <Icon size={34} path={mdiTable} />
          <span>Table</span>
        </Button>
      )}
      {onEmbedCreation != null && (
        <Button
          variant='transparent'
          id='block__creation__embed'
          onClick={onEmbedCreation}
          className='block__view__add__selector'
        >
          <Icon size={34} path={mdiCodeTags} />
          <span>Embed</span>
        </Button>
      )}
    </LeftRightList>
  </Container>
)

const Container = styled.div`
  .block__creation__list {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  button {
    height: auto;
    max-height: none;
    padding: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.md}px;
    .button__label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .icon {
        margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
      }
      span {
        font-size: ${({ theme }) => theme.sizes.fonts.md}px;
      }
    }
  }

  button + button {
    margin-left: ${({ theme }) => theme.sizes.spaces.md}px;
  }
`

export default BlockCreationModal
