import React, { useCallback, useState, useMemo } from 'react'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import {
  destroyDocBookmark,
  createDocBookmark,
  CreateDocBookmarkResponseBody,
  DestroyDocBookmarkResponseBody,
} from '../../../../api/teams/docs/bookmarks'
import { useNav } from '../../../../lib/stores/nav'
import {
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../../../lib/keyboard'
import { isDocBookmarkShortcut } from '../../../../lib/shortcuts'
import { usePage } from '../../../../lib/stores/pageStore'
import IconMdi from '../../../atoms/IconMdi'
import { mdiStar, mdiStarOutline } from '@mdi/js'
import { StyledTopBarIcon } from '../styled'
import Spinner from '../../../atoms/CustomSpinner'
import cc from 'classcat'
import { useToast } from '../../../../../lib/v2/stores/toast'

interface DocBookmarkProps {
  currentDoc: SerializedDocWithBookmark
}

const DocBookmark = ({ currentDoc }: DocBookmarkProps) => {
  const [sendingBookmark, setSendingBookmark] = useState<boolean>(false)
  const { updateDocsMap } = useNav()
  const { pushMessage } = useToast()
  const { setPartialPageData } = usePage()

  const toggleDocBookmark = useCallback(async () => {
    if (sendingBookmark) {
      return
    }
    setSendingBookmark(true)
    try {
      let data: CreateDocBookmarkResponseBody | DestroyDocBookmarkResponseBody
      if (currentDoc.bookmarked) {
        data = await destroyDocBookmark(currentDoc.teamId, currentDoc.id)
      } else {
        data = await createDocBookmark(currentDoc.teamId, currentDoc.id)
      }
      updateDocsMap([data.doc.id, data.doc])
      setPartialPageData({ pageDoc: data.doc })
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not bookmark this doc',
      })
    }
    setSendingBookmark(false)
  }, [
    setSendingBookmark,
    pushMessage,
    updateDocsMap,
    sendingBookmark,
    currentDoc,
    setPartialPageData,
  ])

  const docPageControlsKeyDownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isDocBookmarkShortcut(event)) {
        preventKeyboardEventPropagation(event)
        toggleDocBookmark()
        return
      }
    }
  }, [toggleDocBookmark])
  useGlobalKeyDownHandler(docPageControlsKeyDownHandler)

  return (
    <StyledTopBarIcon
      onClick={toggleDocBookmark}
      className={cc([currentDoc.bookmarked && 'active'])}
      style={{ margin: '0 4px' }}
    >
      {sendingBookmark ? (
        <Spinner style={{ width: 16, height: 16 }} />
      ) : (
        <IconMdi
          path={currentDoc.bookmarked ? mdiStar : mdiStarOutline}
          size={24}
        />
      )}
    </StyledTopBarIcon>
  )
}

export default DocBookmark
