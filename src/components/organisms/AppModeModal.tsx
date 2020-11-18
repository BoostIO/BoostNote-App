import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { usePreferences } from '../../lib/preferences'
import { border, secondaryButtonStyle } from '../../lib/styled/styleFunctions'
import { FormBlockquote } from '../atoms/form'
import Image from '../atoms/Image'
import {
  useCheckedFeatures,
  featureAppModeSelect,
} from '../../lib/checkedFeatures'
import ModalContainer from '../molecules/ModalContainer'
import Icon from '../atoms/Icon'
import { mdiClose } from '@mdi/js'

const AppModeModal = () => {
  const { setPreferences } = usePreferences()
  const { checkFeature } = useCheckedFeatures()

  const closeModal = useCallback(() => {
    checkFeature(featureAppModeSelect)
  }, [checkFeature])

  const chooseNoteAppMode = useCallback(() => {
    setPreferences({
      'general.appMode': 'note',
    })
    closeModal()
  }, [setPreferences, closeModal])

  const chooseWikiAppMode = useCallback(() => {
    setPreferences({
      'general.appMode': 'wiki',
    })
    closeModal()
  }, [setPreferences, closeModal])

  return (
    <ModalContainer onShadowClick={closeModal}>
      <Container>
        <button className='closeButton' onClick={closeModal}>
          <Icon path={mdiClose} />
        </button>
        <div className='scrollable'>
          <h1 className='header'>Choose App Mode</h1>
          <div className='optionGroup'>
            <button className='option' onClick={chooseWikiAppMode}>
              <Image src='/app/static/wiki-app-mode.png' />
              <h2>
                Wiki App Mode <small>(New)</small>
              </h2>
              <p>
                Notes are listed along with folders in the storage navigator.
              </p>
            </button>
            <button className='option' onClick={chooseNoteAppMode}>
              <Image src='/app/static/note-app-mode.png' />
              <h2>Note App Mode</h2>
              <p>Notes are listed in a separated list navigator.</p>
            </button>
          </div>
          <FormBlockquote>
            You can always switch the app mode again from the Preferences modal.
          </FormBlockquote>
        </div>
      </Container>
    </ModalContainer>
  )
}

export default AppModeModal

const Container = styled.div`
  position: relative;
  margin: 50px auto;
  background-color: ${({ theme }) => theme.navBackgroundColor};
  max-width: 800px;
  max-height: 500px;
  z-index: 6002;
  ${border}
  border-radius: 10px;
  overflow: hidden;
  & > .closeButton {
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    box-sizing: border-box;
    font-size: 18px;
    outline: none;

    transition: color 200ms ease-in-out;
    color: ${({ theme }) => theme.navButtonColor};
    &:hover {
      color: ${({ theme }) => theme.navButtonHoverColor};
    }

    &:active,
    &.active {
      color: ${({ theme }) => theme.navButtonActiveColor};
    }
  }
  .scrollable {
    padding: 0 10px;
    overflow-y: auto;
    height: 100%;
  }
  .header {
    margin: 5 0 15px;
    text-align: center;
  }
  .optionGroup {
    display: flex;
  }
  .option {
    ${secondaryButtonStyle}
    border-radius: 10px;
    margin-right: 10px;
    overflow: hidden;
    & > img {
      width: 100%;
    }
    & > h2 {
      margin: 0 10px;
    }
    &:last-child {
      margin-right: 0;
    }
  }
`
