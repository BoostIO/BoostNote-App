import React from 'react'
import { sendGAEvent, queueNavigateToGA } from '../../lib/analytics'
import ButtonLink from './ButtonLink'

interface DownloadButtonLinkProps {
  href: string
  gaEventName: string
}

const DownloadButtonLink: React.FC<DownloadButtonLinkProps> = ({
  children,
  href,
  gaEventName,
}) => {
  return (
    <ButtonLink
      bg='teal'
      color='white'
      mx={1}
      my={[1, 0]}
      py={2}
      href={href}
      onClick={(event) => {
        event.preventDefault()
        sendGAEvent(gaEventName)
        queueNavigateToGA(href)
      }}
    >
      {children}
    </ButtonLink>
  )
}

export default DownloadButtonLink
