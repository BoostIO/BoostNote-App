import React, { useCallback } from 'react'
import ModalContainer from '../molecules/ModalContainer'
import { mdiClose } from '@mdi/js'
import Image from '../atoms/Image'
import { useRouter } from '../../lib/router'
import {
  useCheckedFeatures,
  featureBoostHubSignIn,
} from '../../lib/checkedFeatures'
import { usePreferences } from '../../lib/preferences'
import Icon from '../../shared/components/atoms/Icon'
import styled from '../../shared/lib/styled'
import {
  border,
  secondaryButtonStyle,
} from '../../shared/lib/styled/styleFunctions'

interface CreateWorkspaceModalProps {
  closeModal: () => void
}

const CreateWorkspaceModal = ({ closeModal }: CreateWorkspaceModalProps) => {
  const { push } = useRouter()
  const { preferences } = usePreferences()
  const { checkFeature } = useCheckedFeatures()
  const chooseLocalWorkspace = useCallback(() => {
    closeModal()
    push(`/app/storages`)
  }, [push, closeModal])
  const boosthubUserInfo = preferences['cloud.user']
  const chooseCloudWorkspace = useCallback(() => {
    checkFeature(featureBoostHubSignIn)
    closeModal()
    if (boosthubUserInfo == null) {
      push('/app/boosthub/login')
    } else {
      push('/app/boosthub/teams')
    }
  }, [push, checkFeature, closeModal, boosthubUserInfo])

  return (
    <ModalContainer onShadowClick={closeModal}>
      <StyledContainer>
        <button className='closeButton' onClick={closeModal}>
          <Icon path={mdiClose} />
        </button>
        <div>
          <h1 className='header'>Create Space</h1>
          <div className='optionGroup'>
            <button className='option' onClick={chooseLocalWorkspace}>
              <Image
                className='option__image'
                src='/app/static/local-workspace.svg'
              />
              <h2>Local Space</h2>
              <p>Secure all notes in your local machine</p>
            </button>
            <button className='option' onClick={chooseCloudWorkspace}>
              <Image
                className='option__image'
                src='/app/static/cloud-workspace.svg'
              />
              <h2>Cloud Space</h2>
              <p>Share your notes and edit together in realtime</p>
            </button>
          </div>
        </div>
      </StyledContainer>
    </ModalContainer>
  )
}

export default CreateWorkspaceModal

const StyledContainer = styled.div`
  position: relative;
  margin: 50px auto;
  background-color: ${({ theme }) => theme.colors.background.primary};
  max-width: 800px;
  max-height: 500px;
  z-index: 6002;
  ${border};
  border-radius: 10px;
  padding: 15px;
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
    color: ${({ theme }) => theme.colors.text.primary};
    &:hover {
      color: ${({ theme }) => theme.colors.text.link};
    }

    &:active,
    &.active {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }
  .header {
    margin: 0 0 15px;
    text-align: center;
  }
  .optionGroup {
    display: flex;
    gap: 10px;
  }
  .option {
    width: 300px;
    height: 300px;
    ${secondaryButtonStyle};
    border-radius: 10px;
    overflow: hidden;

    & > h2 {
      margin: 0 10px;
    }
  }
  .option__image {
    width: 220px;
    height: 220px;
  }
`
