import React, { useState, useCallback } from 'react'
import { checkedDeprecationNoticeKey } from '../../lib/localStorageKeys'
import styled from '../../lib/styled'
import {
  border,
  backgroundColor,
  flexCenter,
  secondaryButtonStyle,
} from '../../lib/styled/styleFunctions'
import Icon from '../atoms/Icon'
import { mdiAlertOutline } from '@mdi/js'
import { FormPrimaryButton, FormSecondaryButton } from '../atoms/form'

const checkedDeprecationNotice =
  localStorage.getItem(checkedDeprecationNoticeKey) == null

const DeprecationNoticeModal = () => {
  const [showingDeprecationNotice, setShowingDeprecationNotice] = useState(
    checkedDeprecationNotice
  )

  const openModal = useCallback(() => {
    setShowingDeprecationNotice(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowingDeprecationNotice(false)
    localStorage.setItem(checkedDeprecationNoticeKey, 'true')
  }, [])

  const openDownloadLink = useCallback(() => {
    open('https://boostnote.io/#download')
  }, [])

  if (!showingDeprecationNotice) {
    return (
      <DeprecationButton onClick={openModal}>
        <Icon size={18} path={mdiAlertOutline} />
      </DeprecationButton>
    )
  }

  return (
    <FullScreenContainer>
      <BackgroundShadow onClick={closeModal} />
      <ContentContainer>
        <h1>The browser version will be deprecated!</h1>
        <p>
          Due to lack of stability and functionality, we have decided to stop
          supporting the browser version. The app will not be available anymore
          after March 31th, 2021.
        </p>
        <p>Please migrate your data to our desktop app via cloud storage.</p>
        <FormPrimaryButton
          onClick={openDownloadLink}
          style={{ marginBottom: 5 }}
        >
          Download Desktop App
        </FormPrimaryButton>
        <FormSecondaryButton onClick={closeModal}>Close</FormSecondaryButton>
      </ContentContainer>
    </FullScreenContainer>
  )
}

export default DeprecationNoticeModal

const DeprecationButton = styled.button`
  z-index: 7000;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  ${secondaryButtonStyle};
  border-radius: 20px;
`

const FullScreenContainer = styled.div`
  z-index: 7000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${flexCenter}
`

const BackgroundShadow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  ${border}
`

const ContentContainer = styled.div`
  z-index: 7001;
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  padding: 15px;
  border-radius: 10px;
  ${backgroundColor}
  ${border}

  h1, p {
    margin: 0 0 15px;
  }

  h1 {
    text-align: center;
  }

  p {
    line-height: 1.4;
  }
`
