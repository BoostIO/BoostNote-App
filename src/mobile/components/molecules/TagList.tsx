import React, { useCallback } from 'react'
import ButtonIcon from '../../../components/atoms/ButtonIcon'
import styled from '../../../lib/styled'
import {
  iconColor,
  noteListIconColor
} from '../../../lib/styled/styleFunctions'
import { IconTag, IconClose } from '../../../components/icons'

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

const TagListContainer = styled.div`
  display: flex;
  .listItem {
    display: flex;
    margin: 0 2px;
    background-color: #161719;
    color: #acadad;
    margin-right: 5px;
    align-items: center;
  }

  .icon {
    ${noteListIconColor}
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
    <TagListContainer>
      <ButtonIcon className='icon' icon={<IconTag />} />
      {tags.map(tag => (
        <TagListItem
          tagName={tag}
          key={tag}
          removeTagByName={removeTagByName}
        />
      ))}
    </TagListContainer>
  )
}

export default TagList
