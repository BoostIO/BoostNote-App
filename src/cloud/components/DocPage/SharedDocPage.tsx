import React, { useState, useEffect, useRef, useCallback } from 'react'
import useRealtime from '../../lib/editor/hooks/useRealtime'
import { getRandomColor } from '../../lib/utils/string'
import { StyledDocPage } from './styles'
import styled from '../../../design/lib/styled'
import SyncStatus from '../Topbar/SyncStatus'
import PresenceIcons from '../Topbar/PresenceIcons'
import SharePageTopbar from '../SharePageTopBar'
import { SerializedDoc } from '../../interfaces/db/doc'
import MarkdownView from '../MarkdownView'
import Spinner from '../../../design/components/atoms/Spinner'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'

interface SharedDocPageProps {
  doc: SerializedDoc
  token: string
}

const SharedDocPage = ({ doc, token }: SharedDocPageProps) => {
  const [content, setContent] = useState('')
  const [userInfo] = useState(() => ({
    id: '#Guest',
    name: 'Guest',
    color: getRandomColor(),
  }))
  const [loaded, setLoaded] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  const [realtime, connState, otherUsers] = useRealtime({
    token,
    id: doc.id,
    userInfo: userInfo,
  })

  useEffect(() => {
    if (realtime != null) {
      const content = realtime.doc.getText('content')
      setContent(content.toJSON())
      realtime.doc.on('update', () => {
        setContent(content.toJSON())
      })
    }
  }, [realtime])

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

  const reload = useCallback(() => {
    window.location.reload(true)
  }, [])

  return (
    <StyledDocPage>
      <SharePageTopbar>
        <SyncStatus provider={realtime} connState={connState} />
        <PresenceIcons user={userInfo} users={otherUsers} />
      </SharePageTopbar>
      {timedOut && (
        <StyledWarning>
          <ColoredBlock className='connect-warn' variant='info'>
            It seems to be taking a long time to{' '}
            {loaded ? 'reconnect' : 'connect'}, try{' '}
            <span onClick={reload}>reloading</span> the page
          </ColoredBlock>
        </StyledWarning>
      )}
      {loaded ? (
        <>
          <StyledTitle>{doc.title}</StyledTitle>
          <StyledContent>
            <MarkdownView
              content={content}
              shortcodeHandler={() => (
                <span style={{ color: 'red' }}>
                  External entities are not available in shared docs.
                </span>
              )}
            />
          </StyledContent>
        </>
      ) : (
        <>
          <h3>Preparing Session..</h3>
          <span>
            <Spinner />
          </span>
        </>
      )}
    </StyledDocPage>
  )
}

export default SharedDocPage

const StyledContent = styled.div`
  width: 100%;
  flex: 1 1 auto;
`

const StyledTitle = styled.h2`
  text-align: left;
  width: 100%;
  display: block;
  font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
  margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  padding: 0 ${({ theme }) => theme.sizes.spaces.md}px;
`

const StyledWarning = styled.div`
  width: 100%;

  .connect-warn {
    width: 100%;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  span {
    cursor: pointer;
    text-decoration: underline;
  }
`
