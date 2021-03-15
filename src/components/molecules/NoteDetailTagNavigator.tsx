import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import styled from '../../lib/styled'
import { mdiPlus } from '@mdi/js'
import { useRouteParams } from '../../lib/routeParams'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import TagNavigatorListItem from '../atoms/TagNavigatorListItem'
import TagNavigatorNewTagPopup from '../atoms/TagNavigatorNewTagPopup'
import { useTranslation } from 'react-i18next'
import { PopulatedTagDoc, NoteStorage } from '../../lib/db/types'
import { entries } from '../../lib/db/utils'

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
`

const TagNavigatorList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  overflow: hidden;
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
  const { t } = useTranslation()
  const storageId = storage.id

  const storageTagMap = useMemo(() => {
    return new Map(entries(storage.tagMap))
  }, [storage.tagMap])

  const routeParams = useRouteParams()

  const currentTagName = useMemo(() => {
    if (routeParams.name !== 'storages.tags.show') {
      return null
    }
    return routeParams.tagName
  }, [routeParams])

  const [newTagPopupPosition, setNewTagPopupPosition] = useState<{
    top: number
    right: number
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const closeNewTagPopup = useCallback(() => {
    setNewTagPopupPosition(null)
    if (buttonRef.current == null) {
      return
    }
    buttonRef.current.focus()
  }, [setNewTagPopupPosition])

  const showNewTagPopup = useCallback(() => {
    const rect = buttonRef.current!.getBoundingClientRect()
    setNewTagPopupPosition({
      right: 10,
      top: rect.bottom,
    })
  }, [setNewTagPopupPosition])

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
      if (newTagPopupPosition == null) {
        return
      }
      showNewTagPopup()
    }
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [newTagPopupPosition, showNewTagPopup])

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
        <ToolbarIconButton
          title={t('tag.add')}
          iconPath={mdiPlus}
          ref={buttonRef}
          onClick={showNewTagPopup}
        />
      </TagNavigatorList>
      {newTagPopupPosition != null && (
        <TagNavigatorNewTagPopup
          tags={tags}
          storageTagMap={storageTagMap}
          close={closeNewTagPopup}
          appendTagByName={appendTagByNameAndRefreshPopupPosition}
          position={newTagPopupPosition}
        />
      )}
    </Container>
  )
}

export default NoteDetailTagNavigator
