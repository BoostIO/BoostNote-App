import React from 'react'
import {
  ModalContainer,
  ModalHeader,
  ModalSubtitle,
  ModalBody,
  ModalFlex
} from './styled'

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
            <img src='/static/Desktop.svg' />
            <button className='button'>Download for Mac</button>
          </div>
          <div className='center'>
            <img src='/static/Mobile.svg' />
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
