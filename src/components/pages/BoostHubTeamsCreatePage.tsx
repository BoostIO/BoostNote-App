import React, { useRef, useState, useCallback } from 'react'
import { boostHubTeamsCreatePageUrl } from '../../lib/boosthub'
import BoostHubWebview, { WebviewControl } from '../atoms/BoostHubWebview'
import { DidFailLoadEvent } from 'electron/main'
import { useRouter } from '../../lib/router'
import styled from '../../shared/lib/styled'
import Button from '../../shared/components/atoms/Button'

const BoostHubTeamsCreatePage = () => {
  const controlRef = useRef<WebviewControl>()
  const [refusedConnection, setRefusedConnection] = useState(false)
  const { push } = useRouter()

  const handleWebviewDidFailLoadEventHandler = useCallback(
    (event: DidFailLoadEvent) => {
      if (event.errorDescription !== 'ERR_CONNECTION_REFUSED') {
        return
      }

      setRefusedConnection(true)
    },
    []
  )

  const reloadWebview = useCallback(() => {
    if (controlRef.current == null) {
      return
    }
    controlRef.current.reload()
    setRefusedConnection(false)
  }, [])

  const navigateToCreateLocalSpacePage = useCallback(() => {
    push('/app/storages')
  }, [push])

  return (
    <PageContainer>
      <WebViewContainer>
        <BoostHubWebview
          controlRef={controlRef}
          src={boostHubTeamsCreatePageUrl}
          onDidFailLoad={handleWebviewDidFailLoadEventHandler}
        />

        {refusedConnection && (
          <ReloadView>
            <div>
              <h1 className='heading'>Cannot Reach Server</h1>
              <p className='description'>
                Please check your internet connection.
              </p>
              <Button variant={'secondary'} onClick={reloadWebview}>
                Reload Page
              </Button>

              <Button
                variant={'secondary'}
                onClick={navigateToCreateLocalSpacePage}
              >
                Create Local Space
              </Button>
            </div>
          </ReloadView>
        )}
      </WebViewContainer>
    </PageContainer>
  )
}

export default BoostHubTeamsCreatePage

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const WebViewContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const ReloadView = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  .heading {
    text-align: center;
  }
  .description {
    text-align: center;
  }
`
