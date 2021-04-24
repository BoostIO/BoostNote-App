import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { useRouteParams } from '../../lib/routeParams'
import TagNavigatorListItem from '../atoms/TagNavigatorListItem'
import TagNavigatorNewTagPopup from '../atoms/TagNavigatorNewTagPopup'
import { PopulatedTagDoc, NoteStorage } from '../../lib/db/types'
import { entries } from '../../lib/db/utils'
import styled from '../../shared/lib/styled'
import { contextMenuFormItem } from '../../shared/lib/styled/styleFunctions'
import IconMdi from '../../cloud/components/atoms/IconMdi'
import { mdiPlus } from '@mdi/js'

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;

  .tag__add--empty {
    ${({ theme }) => contextMenuFormItem({ theme }, ':focus')};

    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    outline: 0;
    width: 100%;
    display: block;
    color: ${({ theme }) => theme.colors.text.subtle};
    height: 32px;
    border-radius: 4px;
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }
    text-align: left;
  }

  .tag__add {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    border-radius: 100%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    color: ${({ theme }) => theme.colors.text.subtle};
    margin: 5px 4px;
    padding: 0;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.primary} !important;
    }
  }
`

const TagNavigatorList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
`

interface NoteDetailTagNavigatorProps {
  storage: NoteStorage
  noteId?: string
  tags: string[]
  appendTagByName: (tagName: string) => void
  removeTagByName: (tagName: string) => void
  updateTagColorByName: (tagName: string, color: string) => void
}

const NoteDetailTagNavigator = ({
  storage,
  noteId,
  tags,
  appendTagByName,
  removeTagByName,
  updateTagColorByName,
}: NoteDetailTagNavigatorProps) => {
  const storageId = storage.id

  const storageTagMap = useMemo(() => {
    return new Map(entries(storage.tagMap))
  }, [storage.tagMap])

  const routeParams = useRouteParams()

  const currentTagName = useMemo(() => {
    if (routeParams.name !== 'workspaces.labels.show') {
      return null
    }
    return routeParams.tagName
  }, [routeParams])

  const [showingNewTagPopup, setShowingNewTagPopup] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const closeNewTagPopup = useCallback(() => {
    setShowingNewTagPopup(false)
    if (buttonRef.current == null) {
      return
    }
    buttonRef.current.focus()
  }, [setShowingNewTagPopup])

  const showNewTagPopup = useCallback(() => {
    setShowingNewTagPopup(true)
  }, [])

  const noteTags = useMemo(() => {
    return tags
      .slice()
      .sort()
      .reduce((list, tagName) => {
        const tagDoc = storageTagMap.get(tagName)
        if (tagDoc != null) {
          list.push(tagDoc)
        }
        return list
      }, [] as PopulatedTagDoc[])
  }, [tags, storageTagMap])

  useEffect(() => {
    const resizeHandler = () => {
      if (!showingNewTagPopup) {
        return
      }
      showNewTagPopup()
    }
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [setShowingNewTagPopup, showNewTagPopup, showingNewTagPopup])

  const appendTagByNameAndRefreshPopupPosition = useCallback(
    (tagName: string) => {
      appendTagByName(tagName)
      showNewTagPopup()
    },
    [appendTagByName, showNewTagPopup]
  )

  return (
    <Container>
      <TagNavigatorList>
        {noteTags.map((tag) => {
          return (
            tag && (
              <TagNavigatorListItem
                key={tag.name}
                storageId={storageId}
                noteId={noteId}
                currentTagName={currentTagName}
                tag={tag}
                removeTagByName={removeTagByName}
                updateTagColorByName={updateTagColorByName}
              />
            )
          )
        })}
      </TagNavigatorList>
      {showingNewTagPopup ? (
        <TagNavigatorNewTagPopup
          tags={tags}
          storageTagMap={storageTagMap}
          close={closeNewTagPopup}
          appendTagByName={appendTagByNameAndRefreshPopupPosition}
        />
      ) : tags.length === 0 ? (
        <button
          className='tag__add--empty'
          ref={buttonRef}
          onClick={showNewTagPopup}
        >
          Add a label
        </button>
      ) : (
        <button className='tag__add' ref={buttonRef} onClick={showNewTagPopup}>
          <IconMdi path={mdiPlus} size={16} />
        </button>
      )}
    </Container>
  )
}

export default NoteDetailTagNavigator
