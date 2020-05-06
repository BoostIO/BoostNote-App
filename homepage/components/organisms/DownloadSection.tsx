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

const MobileAppLink = styled.a<SpaceProps>`
  ${space}
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
        </Box>
      </Box>
    </section>
  )
}

export default DownloadSection
