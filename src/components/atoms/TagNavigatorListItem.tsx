import React, { useCallback, useState } from 'react'
import { mdiClose } from '@mdi/js'
import {
  flexCenter,
  TagStyleProps,
  textOverflow,
} from '../../lib/styled/styleFunctions'
import { useRouter } from '../../lib/router'
import { useTranslation } from 'react-i18next'
import { analyticsEvents, useAnalytics } from '../../lib/analytics'
import DialogColorPicker from './dialog/DialogColorPicker'
import { PopulatedTagDoc } from '../../lib/db/types'
import { BaseTheme } from '../../lib/styled/BaseTheme'
import { isColorBright } from '../../lib/colors'
import { tagBackgroundColor } from '../../shared/lib/styled/styleFunctions'
import styled from '../../shared/lib/styled'
import Icon from '../../shared/components/atoms/Icon'

const TagItem = styled.li<BaseTheme & TagStyleProps>`
  border-radius: 4px;
  white-space: nowrap;
  position: relative;
  ${({ theme, color }) =>
    tagBackgroundColor({ theme, color: color as string })};
  height: 24px;
  max-width: 140px;
  font-size: 14px;
  ${flexCenter};
`

const TagItemAnchor = styled.button<BaseTheme & TagStyleProps>`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding-left: 0.75em;
  text-decoration: none;
  color: #fff;
  ${textOverflow};
  filter: invert(
    ${({ theme, color }) =>
      isColorBright((color as string) || theme.colors.background.secondary)
        ? 100
        : 0}%
  );
`

const TagRemoveButton = styled.button<BaseTheme & TagStyleProps>`
  background-color: transparent;
  cursor: pointer;
  padding: 0 0.25em;
  border: none;
  transition: color 200ms ease-in-out;
  color: #fff;
  filter: invert(
    ${({ theme, color }) =>
      isColorBright((color as string) || theme.colors.background.secondary)
        ? 100
        : 0}%
  );
  width: 24px;
  height: 24px;
  ${flexCenter}
`

interface TagNavigatorListItemProps {
  storageId: string
  tag: PopulatedTagDoc
  noteId?: string
  currentTagName: string | null
  removeTagByName: (tagName: string) => void
  updateTagColorByName: (tagName: string, color: string) => void
}

const TagNavigatorListItem = ({
  storageId,
  tag,
  noteId,
  currentTagName,
  removeTagByName,
  updateTagColorByName,
}: TagNavigatorListItemProps) => {
  const { t } = useTranslation()
  const { push } = useRouter()
  const { report } = useAnalytics()

  const [colorPickerModal, showColorPickerModal] = useState(false)
  const [tagColor, setTagColor] = useState(
    typeof tag.data.color == 'string' ? tag.data.color : ''
  )

  const openTagContextMenu = useCallback(() => {
    showColorPickerModal(true)
  }, [showColorPickerModal])

  const handleColorChangeComplete = useCallback(
    (newColor: string) => {
      showColorPickerModal(false)
      setTagColor(newColor)
      updateTagColorByName(tag.name, newColor)
    },
    [tag, updateTagColorByName]
  )
  return (
    <>
      {colorPickerModal && (
        <DialogColorPicker
          initialColor={tagColor}
          handleChangeComplete={handleColorChangeComplete}
        />
      )}
      <TagItem color={tagColor} onContextMenu={openTagContextMenu}>
        <TagItemAnchor
          color={tagColor}
          title={`#${tag.name}`}
          onClick={() => {
            if (noteId == null) {
              push(`/app/storages/${storageId}/tags/${tag.name}`)
              return
            }
            push(`/app/storages/${storageId}/tags/${tag.name}/${noteId}`)
          }}
          className={currentTagName === tag.name ? 'active' : ''}
        >
          {tag.name}
        </TagItemAnchor>
        <TagRemoveButton
          color={tagColor}
          title={t('tag.removeX', { tag: tag.name })}
          onClick={() => {
            removeTagByName(tag.name)
            report(analyticsEvents.removeNoteTag)
          }}
        >
          <Icon path={mdiClose} />
        </TagRemoveButton>
      </TagItem>
    </>
  )
}

export default TagNavigatorListItem
