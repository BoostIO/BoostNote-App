import React, { useCallback } from 'react'
import Icon from '../../atoms/Icon'
import { mdiClose } from '@mdi/js'
import styled from '../../../lib/styled'
import { iconColor } from '../../../lib/styled/styleFunctions'

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
        <Icon path={mdiClose} />
      </button>
    </div>
  )
}

const StyledParentContainer = styled.div`
  flex: 0 1 auto;
  height: 100%;
  overflow: hidden;
`

const StyledContainer = styled.div`
  display: flex;
  overflow: auto;
  padding-bottom: 17px;
  padding-rigth: 4%;

  .listItem {
    margin: 0 2px;
    height: 32px;
    display: flex;
    align-items: center;
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
    <StyledParentContainer>
      <StyledContainer>
        {tags.map(tag => (
          <TagListItem
            key={tag}
            tagName={tag}
            removeTagByName={removeTagByName}
          />
        ))}
      </StyledContainer>
    </StyledParentContainer>
  )
}

export default TagList
