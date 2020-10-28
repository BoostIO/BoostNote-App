import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { usePreferences } from '../../lib/preferences'
import { border, secondaryButtonStyle } from '../../lib/styled/styleFunctions'
import { FormBlockquote } from '../atoms/form'

interface AppModeModalProps {
  closeModal: () => void
}

const AppModeModal = ({ closeModal }: AppModeModalProps) => {
  const { setPreferences } = usePreferences()

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
    <Container>
      <div className='container'>
        <div className='scrollable'>
          <h1 className='header'>Choose App Mode</h1>
          <div className='optionGroup'>
            <button className='option' onClick={chooseWikiAppMode}>
              <img src='/static/wiki-app-mode.png' />
              <h2>
                Wiki App Mode <small>(New)</small>
              </h2>
              <p>
                Notes are listed along with folders in the storage navigator.
              </p>
            </button>
            <button className='option' onClick={chooseNoteAppMode}>
              <img src='/static/note-app-mode.png' />
              <h2>Note App Mode</h2>
              <p>Notes are listed in a separated list navigator.</p>
            </button>
          </div>
          <FormBlockquote>
            You can always switch the app mode again from the Preferences modal.
          </FormBlockquote>
        </div>
      </div>

      <div className='shadow' onClick={closeModal} />
    </Container>
  )
}

export default AppModeModal

const Container = styled.div`
  z-index: 6000;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  -webkit-app-region: drag;

  & > .container {
    position: relative;
    margin: 50px auto;
    background-color: ${({ theme }) => theme.navBackgroundColor};
    max-width: 800px;
    max-height: 500px;
    z-index: 6002;
    ${border}
    border-radius: 10px;
    overflow: hidden;
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
  }
  & > .shadow {
    position: absolute;
    z-index: 6001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
  }
`
