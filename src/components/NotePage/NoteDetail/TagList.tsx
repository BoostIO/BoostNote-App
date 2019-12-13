import React, { useCallback } from 'react'
import Icon from '../../atoms/Icon'
import styled from '../../../lib/styled'
import { iconColor, inputStyle } from '../../../lib/styled/styleFunctions'
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
        <Icon icon={<IconClose />} />
      </button>
    </div>
  )
}

const StyledContainer = styled.div`
  display: flex;
  .listItem {
    display: flex;
    margin: 0 2px;
    ${inputStyle}
    margin-right: 5px;
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
  }
`

interface TagListProps {
  tags: string[]
  removeTagByName: (tagName: string) => void
}

const TagList = ({ tags, removeTagByName }: TagListProps) => {
  return (
    <StyledContainer>
      <Icon className='icon' icon={<IconHash />} />
      {tags.map(tag => (
        <TagListItem
          tagName={tag}
          key={tag}
          removeTagByName={removeTagByName}
        />
      ))}
    </StyledContainer>
  )
}

export default TagList
