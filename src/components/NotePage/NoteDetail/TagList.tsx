import React, { useCallback } from 'react'
import Icon from '../../atoms/Icon'
import { mdiClose } from '@mdi/js'
import styled from '../../../lib/styled'

interface TagListItemProps {
  tagName: string
  removeTagByName: (tagName: string) => void
}

const TagListItem = ({ tagName, removeTagByName }: TagListItemProps) => {
  const removeTag = useCallback(
    () => {
      removeTagByName(tagName)
    },
    [removeTagByName, tagName]
  )

  return (
    <div className='listItem'>
      <div className='listItem-label'>{tagName}</div>
      <button className='listItem-removeButton' onClick={removeTag}>
        <Icon path={mdiClose} />
      </button>
    </div>
  )
}

const StyledContainer = styled.div`
  display: flex;
  .listItem {
    border: solid 1px ${({ theme }) => theme.colors.border};
    margin: 0 2px;
    display: flex;
  }

  .listItem-label {
    padding: 0 4px;
    line-height: 20px;
  }

  .listItem-removeButton {
    border: none;
    width: 20px;
    height: 20px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    &:hover {
      background-color: ${({ theme }) => theme.colors.alternativeBackground};
    }
    &:active {
      background-color: ${({ theme }) => theme.colors.active};
      color: ${({ theme }) => theme.colors.inverseText};
    }
  }
`

interface TagListProps {
  tags: string[]
  removeTagByName: (tagName: string) => void
}

const TagList = ({ tags, removeTagByName }: TagListProps) => {
  return (
    <StyledContainer>
      {tags.map(tag => (
        <TagListItem
          key={tag}
          tagName={tag}
          removeTagByName={removeTagByName}
        />
      ))}
    </StyledContainer>
  )
}

export default TagList
