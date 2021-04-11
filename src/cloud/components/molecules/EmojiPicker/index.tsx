import React, { useCallback } from 'react'
import { useEmojiPicker } from '../../../lib/stores/emoji'
import { StyledEmojiPicker } from './styled'
import { Picker, EmojiData } from 'emoji-mart'
import { selectTheme } from '../../../lib/styled'
import { useSettings } from '../../../lib/stores/settings'
import { updateFolderEmoji } from '../../../api/teams/folders'
import { useNav } from '../../../lib/stores/nav'
import { updateDocEmoji } from '../../../api/teams/docs'
import CustomButton from '../../atoms/buttons/CustomButton'
import { useWindow } from '../../../lib/stores/window'
import { useToast } from '../../../../lib/v2/stores/toast'

export const EmojiPickerWidth = 350
export const EmojiPickerHeight = 380

const EmojiPicker = () => {
  const {
    closed,
    closeEmojiPicker,
    position,
    resource,
    callback,
  } = useEmojiPicker()
  const pickerRef: React.RefObject<HTMLDivElement> = React.createRef()
  const { settings } = useSettings()
  const { pushMessage } = useToast()
  const { updateFoldersMap, updateDocsMap } = useNav()
  const { windowSize } = useWindow()

  const onBlurHandler = (event: any) => {
    if (
      event.relatedTarget == null ||
      pickerRef.current == null ||
      !pickerRef.current.contains(event.relatedTarget)
    ) {
      closeEmojiPicker()
      return
    }
  }

  const updateItemEmoji = useCallback(
    async (emojiId?: string) => {
      if (callback != null) {
        callback(emojiId)
        return
      }

      if (resource == null) {
        return
      }

      try {
        if (resource.type === 'doc') {
          const { doc } = await updateDocEmoji(resource.item, emojiId)
          updateDocsMap([doc.id, doc])
          return
        }
        const { folder } = await updateFolderEmoji(resource.item, emojiId)
        updateFoldersMap([folder.id, folder])
        return
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: `The emoji could not be modified`,
        })
      }
    },
    [callback, resource, pushMessage, updateFoldersMap, updateDocsMap]
  )

  const changeEmoji = useCallback(
    (emoji: EmojiData) => {
      updateItemEmoji(emoji.id)
      closeEmojiPicker()
    },
    [closeEmojiPicker, updateItemEmoji]
  )

  if (closed) return null

  return (
    <StyledEmojiPicker
      tabIndex={-1}
      ref={pickerRef}
      onBlur={onBlurHandler}
      style={{
        left:
          position.x + EmojiPickerWidth < windowSize.width
            ? position.x
            : windowSize.width - EmojiPickerWidth,
        top:
          position.y + EmojiPickerHeight < windowSize.height
            ? position.y
            : windowSize.height - EmojiPickerHeight,
      }}
    >
      <Picker
        set='apple'
        onSelect={changeEmoji}
        showPreview={false}
        showSkinTones={false}
        title=''
        autoFocus={true}
        color={selectTheme(settings['general.theme']).primaryTextColor}
        sheetSize={32}
      />
      <CustomButton
        variant='secondary'
        style={{
          height: '20px',
          lineHeight: '20px',
        }}
        onClick={() => {
          updateItemEmoji()
          closeEmojiPicker()
        }}
      >
        clear
      </CustomButton>
    </StyledEmojiPicker>
  )
}

export default EmojiPicker
