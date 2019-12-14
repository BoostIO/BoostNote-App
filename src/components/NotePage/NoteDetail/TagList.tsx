import React, { useCallback } from 'react'
import ButtonIcon from '../../atoms/ButtonIcon'
import styled from '../../../lib/styled'
import { iconColor } from '../../../lib/styled/styleFunctions'
import { IconHash, IconClose } from '../../icons'

interface TagListItemProps {
  tagName: string
  removeTagByName: (tagName: string) => void
}

const TagListItem = ({ tagName, removeTagByName }: TagListItemProps) => {
  const removeTag = useCallback(() => {
    removeTagByName(tagName)
  }, [removeTagByName, tagName])

  return (
    <div className='listItem'>
      <div className='listItem-label'>{tagName}</div>
      <button className='listItem-removeButton' onClick={removeTag}>
        <IconClose />
      </button>
    </div>
  )
}

const StyledContainer = styled.div`
  display: flex;
  .listItem {
    margin: 0 2px;
    display: flex;
  }

  .icon {
    ${iconColor}
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
    ${iconColor};
    background-color: transparent;

    svg {
      vertical-align: top;
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
      <ButtonIcon className='icon' icon={<IconHash />} />
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
