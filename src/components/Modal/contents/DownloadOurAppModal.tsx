import React from 'react'
import {
  ModalContainer,
  ModalHeader,
  ModalSubtitle,
  ModalBody,
  ModalFlex,
} from './styled'
import Image from '../../atoms/Image'
import AppLink from '../../atoms/AppLink'
import { openNew } from '../../../lib/platform'

const DownloadOurAppModal = () => {
  return (
    <ModalContainer>
      <ModalHeader>Download our apps</ModalHeader>
      <ModalSubtitle>
        Use Boostnote on your local and focus on your work!
      </ModalSubtitle>
      <ModalBody>
        <ModalFlex>
          <div className='center'>
            <Image src='/app/static/Desktop.svg' />
            <AppLink />
          </div>
          <div className='center'>
            <Image src='/app/static/Mobile.svg' />
            <div>
              <button
                className='button primary'
                onClick={() => {
                  openNew(
                    'https://apps.apple.com/us/app/boostnote-mobile/id1498182749'
                  )
                }}
                style={{ marginBottom: '1em' }}
              >
                Download iOS
              </button>
              <button
                className='button primary'
                onClick={() => {
                  openNew(
                    'https://play.google.com/store/apps/details?id=com.boostio.boostnote'
                  )
                }}
              >
                Download Android
              </button>
            </div>
          </div>
        </ModalFlex>
      </ModalBody>
    </ModalContainer>
  )
}

export default DownloadOurAppModal
