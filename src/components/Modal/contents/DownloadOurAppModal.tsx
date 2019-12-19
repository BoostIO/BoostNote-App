import React from 'react'
import {
  ModalContainer,
  ModalHeader,
  ModalSubtitle,
  ModalBody,
  ModalFlex
} from './styled'
import Image from '../../atoms/Image'
import AppLink from '../../atoms/AppLink'

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
            <button className='button darker' disabled={true}>
              Launching Soon
            </button>
            <span className='subtext'>
              We are planning for a launch by the end of the year.
            </span>
          </div>
        </ModalFlex>
      </ModalBody>
    </ModalContainer>
  )
}

export default DownloadOurAppModal
