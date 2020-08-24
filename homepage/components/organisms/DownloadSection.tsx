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
import Row from '../atoms/Row'
import Column from '../atoms/Column'
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
import { useTranslation } from 'react-i18next'

const Container = styled.div<SpaceProps>`
  max-width: 70em;
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
  const { t } = useTranslation()

  return (
    <section>
      <Box py={8} bg='#f0f0f0'>
        <Container>
          <Text
            as='h2'
            id='download'
            fontSize={[3, 4, 5]}
            mt={0}
            mb={4}
            textAlign='center'
          >
            📦 {t('common.downloadApp')}
          </Text>
          <Row>
            <Column width={[1, 1, 1 / 2]}>
              <Box as='ul' my={4}>
                <li>
                  <Text as='h3' fontSize={[2, 3]} my={4}>
                    <Icon path={mdiApple} /> macOS
                  </Text>
                  <FlexBox flexWrap='wrap'>
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
                  <Text as='h3' fontSize={[2, 3]} my={4}>
                    <Icon path={mdiMicrosoftWindows} /> Windows
                  </Text>
                  <FlexBox flexWrap='wrap'>
                    <DownloadButtonLink
                      href={windowsAppIntallerUrl}
                      gaEventName='download-win'
                    >
                      <Icon path={mdiDownload} /> .exe (NSIS) (Windows)
                    </DownloadButtonLink>
                  </FlexBox>
                </li>
                <li>
                  <Text as='h3' fontSize={[2, 3]} my={4}>
                    <Icon path={mdiLinux} /> Linux
                  </Text>
                  <FlexBox flexWrap='wrap'>
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
              </Box>
            </Column>
            <Column width={[1, 1, 1 / 2]}>
              <Box as='ul' my={4}>
                <li>
                  <Text as='h3' fontSize={[2, 3]} my={4}>
                    <Icon path={mdiCellphone} /> {t('common.mobileApp')}
                  </Text>
                  <FlexBox flexWrap='wrap'>
                    <MobileAppLink
                      mx={1}
                      target='_blank'
                      href={androidPlayStoreUrl}
                      rel='noopener noreferrer'
                    >
                      <img
                        height='50'
                        src='/static/google-play-store-badge.svg'
                      />
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
                  <Text as='h3' fontSize={[2, 3]} my={4}>
                    {t('download.legacyApp')}
                  </Text>
                  <Container>
                    <Text as='p'>{t('download.legacyAppDescription')}</Text>
                  </Container>
                  <FlexBox flexWrap='wrap' mt={3}>
                    <ButtonLink
                      bg='teal'
                      color='white'
                      mx={1}
                      my={1}
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
                      <Icon path={mdiOpenInNew} />{' '}
                      {t('download.legacyDownloadLinks')}
                    </ButtonLink>
                    <ButtonLink
                      color='teal'
                      mx={1}
                      my={1}
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
                      <Icon path={mdiOpenInNew} />{' '}
                      {t('download.legacyRepository')}
                    </ButtonLink>
                  </FlexBox>
                </li>
              </Box>
            </Column>
          </Row>
        </Container>
      </Box>
    </section>
  )
}

export default DownloadSection
