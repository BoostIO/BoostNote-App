import React, { useCallback } from 'react'
import styled from '../../../lib/styled'
import { inputStyle } from '../../../lib/styled/styleFunctions'
import Icon from '../../atoms/Icon'
import { mdiTagMultiple, mdiClose } from '@mdi/js'

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

const TagListContainer = styled.div`
  display: flex;
  .listItem {
    display: flex;
    margin-right: 5px;
    padding: 0 0 0 0.5em;
    ${inputStyle}
    border-radius: 13px;
  }

  .icon {
    color: ${({ theme }) => theme.navButtonColor};
  }

  .listItem-label {
    padding-right: 0.25em;
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
    background-color: transparent;

    transition: color 200ms ease-in-out;
    color: ${({ theme }) => theme.navButtonColor};
    &:hover {
      color: ${({ theme }) => theme.navButtonHoverColor};
    }

    &:active,
    .active {
      color: ${({ theme }) => theme.navButtonActiveColor};
    }
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
      <Icon className='icon' size={18} path={mdiTagMultiple} />
      {tags.map((tag) => (
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
