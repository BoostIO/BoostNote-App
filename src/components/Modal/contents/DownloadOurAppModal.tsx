import React from 'react'
import {
  ModalContainer,
  ModalHeader,
  ModalSubtitle,
  ModalBody,
  ModalFlex
} from './styled'
import Image from '../../atoms/Image'
import { getAppLinkFromUserAgent } from '../../../lib/download'
import { openNew } from '../../../lib/utils/platform'
import isElectron from 'is-electron'

interface PrimaryLinkProps {
  children: string
}

const DownloadOurAppModal = () => {
  const runningOnElectron = isElectron()
  const userAgent = getAppLinkFromUserAgent()

  const AppLink = ({ children }: PrimaryLinkProps) => {
    const handleClick = (event: React.MouseEvent) => {
      event.preventDefault()
      openNew(runningOnElectron ? 'https://note.boostio.co' : userAgent.link)
    }

    return (
      <button
        className='button'
        disabled={!runningOnElectron && userAgent.link == null}
        onClick={handleClick}
      >
        {children}
      </button>
    )
  }

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
            <img src='/app/static/Desktop.svg' />
            <AppLink>
              {`Download ${
                userAgent.os !== '' ? `for ${userAgent.os}` : 'our app'
              }`}
            </AppLink>
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
