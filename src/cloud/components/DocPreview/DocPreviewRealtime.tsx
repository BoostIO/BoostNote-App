import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Spinner from '../../../design/components/atoms/Spinner'
import { buildIconUrl } from '../../api/files'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedUser } from '../../interfaces/db/user'
import useRealtime from '../../lib/editor/hooks/useRealtime'
import { getColorFromString, getRandomColor } from '../../lib/utils/string'
import CustomizedMarkdownPreviewer from '../MarkdownView/CustomizedMarkdownPreviewer'

interface DocPreviewRealtimeProps {
  doc: SerializedDocWithSupplemental
  token: string
  user?: SerializedUser
}

const DocPreviewRealtime = ({ doc, token, user }: DocPreviewRealtimeProps) => {
  const [content, setContent] = useState('')
  const [loaded, setLoaded] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const [_timedOut, setTimedOut] = useState(false)

  const userInfo = useMemo(() => {
    if (user == null) {
      return {
        id: '#Guest',
        name: 'Guest',
        color: getRandomColor(),
      }
    }
    return {
      id: user.id,
      name: user.displayName,
      color: getColorFromString(user.id),
      icon: user.icon != null ? buildIconUrl(user.icon.location) : undefined,
    }
  }, [user])

  const [realtime, connState] = useRealtime({
    token,
    id: doc.id,
    userInfo,
  })

  useEffect(() => {
    if (connState === 'connected') {
      setTimedOut(false)
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current)
      }
    }

    if (
      (connState === 'reconnecting' || connState === 'disconnected') &&
      timeoutRef.current == null
    ) {
      timeoutRef.current = window.setTimeout(() => {
        setTimedOut(true)
      }, 30000)
    }

    if (connState === 'synced') {
      setLoaded(true)
    }
  }, [connState])

  const updateContent = useCallback(() => {
    if (realtime == null) {
      return
    }
    setContent(realtime.doc.getText('content').toString())
  }, [realtime])

  useEffect(() => {
    updateContent()
  }, [updateContent])

  useEffect(() => {
    if (realtime != null) {
      realtime.doc.on('update', () => {
        updateContent()
      })
      return () =>
        realtime.doc.off('update', () => {
          updateContent()
        })
    }
    return undefined
  }, [realtime, updateContent])

  if (!loaded) {
    return (
      <Flexbox>
        <Spinner />
      </Flexbox>
    )
  }

  return (
    <CustomizedMarkdownPreviewer
      content={content}
      className='doc-preview__content__scroller'
    />
  )
}

export default DocPreviewRealtime
