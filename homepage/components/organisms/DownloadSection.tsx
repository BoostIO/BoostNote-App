import React from 'react'
import Box from '../atoms/Box'
import Text from '../atoms/Text'
import Icon from '../atoms/Icon'
import {
  mdiLinux,
  mdiDownload,
  mdiApple,
  mdiMicrosoftWindows,
  mdiCellphone,
  mdiOpenInNew,
} from '@mdi/js'
import FlexBox from '../atoms/FlexBox'
import {
  macDmgDownloadUrl,
  macZipDownloadUrl,
  windowsAppIntallerUrl,
  linuxAppImageDownloadUrl,
  linuxDebDownloadUrl,
  androidPlayStoreUrl,
  iOSAppStoreUrl,
} from '../../lib/download'
import DownloadButtonLink from '../atoms/DownloadButtonLink'
import { space, SpaceProps } from 'styled-system'
import styled from '../../lib/styled'
import ButtonLink from '../atoms/ButtonLink'
import { sendGAEvent, queueNavigateToGA } from '../../lib/analytics'

const Container = styled.div<SpaceProps>`
  max-width: 60em;
  margin: 0 auto;
  ${space}
`

const MobileAppLink = styled.a<SpaceProps>`
  ${space}
  &:hover {
    cursor: pointer;
    transform: translateY(-3px);
    transition: 0.2s cubic-bezier(0, 0, 0.25, 1);
  }
`

const DownloadSection = () => {
  return (
    <section>
      <Box py={4} bg='#f0f0f0'>
        <Text as='h2' id='download' fontSize={4} my={4} textAlign='center'>
          📦 Download App
        </Text>
        <Box as='ul' my={4}>
          <li>
            <Text as='h3' fontSize={3} my={4} textAlign='center'>
              <Icon path={mdiApple} /> macOS
            </Text>
            <FlexBox justifyContent='center' flexWrap='wrap'>
              <DownloadButtonLink
                href={macDmgDownloadUrl}
                gaEventName='download-mac'
              >
                <Icon path={mdiDownload} />
                .dmg (macOS)
              </DownloadButtonLink>
              <DownloadButtonLink
                href={macZipDownloadUrl}
                gaEventName='download-mac'
              >
                <Icon path={mdiDownload} /> .zip (macOS)
              </DownloadButtonLink>
            </FlexBox>
          </li>
          <li>
            <Text as='h3' fontSize={3} my={4} textAlign='center'>
              <Icon path={mdiMicrosoftWindows} /> Windows
            </Text>
            <FlexBox justifyContent='center' flexWrap='wrap'>
              <DownloadButtonLink
                href={windowsAppIntallerUrl}
                gaEventName='download-win'
              >
                <Icon path={mdiDownload} /> .exe (NSIS installer) (Windows)
              </DownloadButtonLink>
            </FlexBox>
          </li>
          <li>
            <Text as='h3' fontSize={3} my={4} textAlign='center'>
              <Icon path={mdiLinux} /> Linux
            </Text>
            <FlexBox justifyContent='center' flexWrap='wrap'>
              <DownloadButtonLink
                href={linuxAppImageDownloadUrl}
                gaEventName='download-linux'
              >
                <Icon path={mdiDownload} /> .AppImage (Linux)
              </DownloadButtonLink>
              <DownloadButtonLink
                href={linuxDebDownloadUrl}
                gaEventName='download-linux'
              >
                <Icon path={mdiDownload} /> .deb (Linux)
              </DownloadButtonLink>
            </FlexBox>
          </li>
          <li>
            <Text as='h3' fontSize={3} my={4} textAlign='center'>
              <Icon path={mdiCellphone} /> Mobile App
            </Text>
            <FlexBox justifyContent='center' flexWrap='wrap'>
              <MobileAppLink
                mx={1}
                target='_blank'
                href={androidPlayStoreUrl}
                rel='noopener noreferrer'
              >
                <img height='50' src='/static/google-play-store-badge.svg' />
              </MobileAppLink>
              <MobileAppLink
                mx={1}
                target='_blank'
                href={iOSAppStoreUrl}
                rel='noopener noreferrer'
              >
                <img height='50' src='/static/ios-app-store-badge.svg' />
              </MobileAppLink>
            </FlexBox>
          </li>
          <li>
            <Text as='h3' fontSize={3} my={4} textAlign='center'>
              Legacy App
            </Text>
            <Container>
              <Text as='p' textAlign='center'>
                We are going to keep maintaining the old app until the current
                Boost Note.next support most of features of the old app like
                file system based storage and markdown extensions. So please
                don&apos;t force yourself too much to migrate to the new app.
              </Text>
            </Container>
            <FlexBox justifyContent='center' flexWrap='wrap'>
              <ButtonLink
                bg='teal'
                color='white'
                mx={1}
                my={[1, 0]}
                py={2}
                href='https://github.com/BoostIO/boost-releases/releases/latest'
                onClick={(event) => {
                  event.preventDefault()
                  sendGAEvent('download-old')
                  queueNavigateToGA(
                    'https://github.com/BoostIO/boost-releases/releases/latest',
                    true
                  )
                }}
              >
                <Icon path={mdiOpenInNew} /> Legacy Download Links
              </ButtonLink>
              <ButtonLink
                color='teal'
                mx={1}
                my={[1, 0]}
                py={2}
                href='https://github.com/BoostIO/BoostNote'
                onClick={(event) => {
                  event.preventDefault()
                  sendGAEvent('repository-old')
                  queueNavigateToGA(
                    'https://github.com/BoostIO/BoostNote',
                    true
                  )
                }}
              >
                <Icon path={mdiOpenInNew} /> Legacy Repository
              </ButtonLink>
            </FlexBox>
          </li>
        </Box>
      </Box>
    </section>
  )
}

export default DownloadSection
