import React, { useCallback } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Button from '../../../../design/components/atoms/Button'
import ModalContainer from './atoms/ModalContainer'
import { boostHubBaseUrl } from '../../../../cloud/lib/consts'
import SettingsModal from './SettingsModal'

export type IntroPopupVariant =
  | 'doc-limit'
  | 'version-history'
  | 'sharing-options'

interface UpgradeIntroModalProps {
  variant: IntroPopupVariant
}

const UpgradeIntroModal = ({ variant }: UpgradeIntroModalProps) => {
  const { closeLastModal: closeModal, openModal } = useModal()

  const opeeSpaceUpgradeModal = useCallback(() => {
    openModal(<SettingsModal initialTab='space-upgrade' />)
  }, [openModal])

  return (
    <ModalContainer title={'Upgrade Plan'}>
      <Container>
        <Flexbox flex='1 1 auto' direction='column' alignItems='flex-start'>
          {variant == 'doc-limit' && (
            <>
              <h1 className='intro-title'>Do you need more than 30 docs?</h1>
              <img
                src={`${boostHubBaseUrl}/app/static/images/img_unlimited-cloud-doc.jpg`}
                className='intro-img'
              />
              <div className='intro-description'>
                <p>
                  The Free plan lets you create 30 docs per team, but you can
                  make it unlimited by choosing either the Standard plan ($3~)
                  or Pro plan ($8~) if you need more than that.
                </p>
                <p>Check the pricing table to learn more!</p>
              </div>
            </>
          )}
          {variant == 'version-history' && (
            <>
              <h1 className='intro-title'>
                Want to check this document&apos;s history?
              </h1>
              <img
                src={`${boostHubBaseUrl}/app/static/images/img_version-history.jpg`}
                className='intro-img'
              />
              <div className='intro-description'>
                <p>
                  Check the revision history of a document. Boost Note
                  automatically stores all changes for every document. If you
                  find a broken document, you can easily roll back to one of the
                  previous versions in one click.
                </p>
                <p>
                  Each history lasts 7 days for the Standard plan and keeps
                  forever for the Pro plan!
                </p>
              </div>
            </>
          )}
          {variant == 'sharing-options' && (
            <>
              <h1 className='intro-title'>Unlock detailed sharing options?</h1>
              <img
                src={`${boostHubBaseUrl}/app/static/images/img_public-private-sharing.jpg`}
                className='intro-img'
              />
              <div className='intro-description'>
                <p>
                  Setting passwords and adding expiration dates for sharing is
                  one of the Pro plan features. If you want to share your
                  documents publicly but with some protection, these sharing
                  options would be perfect for you!
                </p>
                <p>
                  Check the details of the Pro plan and learn what you can do
                  with this plan!
                </p>
              </div>
            </>
          )}
        </Flexbox>
        <Flexbox flex='0 0 auto' direction='column' className='button__group'>
          <Button
            variant='primary'
            className='intro-btn'
            onClick={(event) => {
              event.preventDefault()

              opeeSpaceUpgradeModal()
            }}
          >
            Check Upgrade Plans
          </Button>
          <Button
            variant='bordered'
            className='intro-btn'
            onClick={(event) => {
              event.preventDefault()
              closeModal()
            }}
          >
            Cancel
          </Button>
        </Flexbox>
      </Container>
    </ModalContainer>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => theme.sizes.spaces.md}px
    ${({ theme }) => theme.sizes.spaces.l}px;

  .intro-title {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
  }

  .intro-img {
    max-width: 100%;
  }

  .intro-description {
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;

    p {
      line-height: 1.6;
    }
  }

  .intro-btn {
    width: 100%;

    + .intro-btn {
      margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
      margin-left: 0;
    }
  }
`

export default UpgradeIntroModal
