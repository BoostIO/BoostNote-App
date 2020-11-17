import React, { useCallback } from 'react'
import {
  useCheckedFeatures,
  featureBoostHubIntro,
  featureBoostHubSignIn,
} from '../../lib/checkedFeatures'
import ModalContainer from '../molecules/ModalContainer'
import styled from '../../lib/styled'
import { border } from '../../lib/styled/styleFunctions'
import { FormPrimaryButton } from '../atoms/form'
import BoostHubFeatureIntro from '../molecules/BoostHubFeatureIntro'
import { useRouter } from '../../lib/router'
import { dispatchBoostHubLoginRequestEvent } from '../../lib/events'

const BoostHubIntroModal = () => {
  const { checkFeature } = useCheckedFeatures()
  const { push } = useRouter()
  const close = useCallback(() => {
    checkFeature(featureBoostHubIntro)
  }, [checkFeature])

  const navigateToLoginPage = useCallback(() => {
    checkFeature(featureBoostHubSignIn)
    checkFeature(featureBoostHubIntro)
    push(`/app/boosthub/login`)
    setTimeout(() => {
      console.log('reqqq')
      dispatchBoostHubLoginRequestEvent()
    }, 1000)
  }, [checkFeature, push])

  return (
    <ModalContainer onShadowClick={close}>
      <Container>
        <h1 className='heading'>Start Collaborating</h1>
        <p className='description'>
          We&apos;re very excited to release the collaboration feature. You can
          switch your personal and team account in the app navigator.
        </p>
        <div className='features'>
          <BoostHubFeatureIntro />
        </div>

        <div className='control'>
          <FormPrimaryButton onClick={navigateToLoginPage}>
            Get Started for Free
          </FormPrimaryButton>
        </div>
      </Container>
    </ModalContainer>
  )
}
export default BoostHubIntroModal

const Container = styled.div`
  position: relative;
  user-select: none;
  margin: 50px auto;
  padding: 20px;
  background-color: ${({ theme }) => theme.navBackgroundColor};
  max-width: 1020px;
  max-height: 100%;
  z-index: 6002;
  ${border}
  border-radius: 10px;
  overflow-x: hidden;
  overflow-y: auto;
  & > .heading {
    text-align: center;
    text-transform: uppercase;
    margin-top: 0;
  }
  & > .description {
    text-align: center;
  }
  & > .features {
    margin-bottom: 15px;
  }
  & > .control {
    display: flex;
    justify-content: center;
  }
`
