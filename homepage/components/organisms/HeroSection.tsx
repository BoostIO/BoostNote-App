import React, { useState } from 'react'
import { useEffectOnce } from 'react-use'
import { getOSName, OSName } from '../../lib/platform'
import Container from '../atoms/Container'
import { useTranslation } from 'react-i18next'
import Box from '../atoms/Box'
import FlexBox from '../atoms/FlexBox'
import styled from '../../lib/styled'
import {
  typography,
  TypographyProps,
  ColorProps,
  color,
  space,
  SpaceProps,
} from 'styled-system'
import ButtonLink from '../atoms/ButtonLink'
import {
  macDmgDownloadUrl,
  macZipDownloadUrl,
  windowsAppIntallerUrl,
  linuxAppImageDownloadUrl,
  linuxDebDownloadUrl,
  androidPlayStoreUrl,
  iOSAppStoreUrl,
} from '../../lib/download'
import Row from '../atoms/Row'
import Column from '../atoms/Column'
import Icon from '../atoms/Icon'
import { mdiDownload, mdiOpenInApp } from '@mdi/js'
import DownloadButtonLink from '../atoms/DownloadButtonLink'
import { sendGAEvent, queueNavigateToGA } from '../../lib/analytics'
import Text from '../atoms/Text'
import SubscribeNewsLettersForm from './SubscribeNewsLettersForm'

const HeroTitle = styled.h1<TypographyProps | SpaceProps>`
  ${typography}
  ${space}
`

const HeroSubTitle = styled.h2<TypographyProps | ColorProps | SpaceProps>`
  ${typography}
  ${color}
  ${space}
`

const DownloadButtonLinksFragment = () => {
  const { t } = useTranslation()

  const [osName, setOSName] = useState<OSName | null>(null)

  useEffectOnce(() => {
    setOSName(getOSName())
  })

  switch (osName) {
    case 'mac':
      return (
        <>
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
        </>
      )
    case 'win':
      return (
        <>
          <DownloadButtonLink
            href={windowsAppIntallerUrl}
            gaEventName='download-win'
          >
            <Icon path={mdiDownload} /> .exe (NSIS installer) (Windows)
          </DownloadButtonLink>
        </>
      )
    case 'linux':
      return (
        <>
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
        </>
      )
    case 'android':
    case 'ios':
      return null
    default:
      return (
        <ButtonLink bg='teal' color='white' href='/#download'>
          <Icon path={mdiDownload} /> {t('common.downloadApp')}
        </ButtonLink>
      )
  }
}

const MobileAppLink = styled.a<SpaceProps>`
  ${space}
  &:hover {
    cursor: pointer;
    transform: translateY(-3px);
    transition: 0.2s cubic-bezier(0, 0, 0.25, 1);
  }
`

const HeroContents = styled.div<SpaceProps>`
  ${space}
  height: 100%;
  overflow-x: hidden;

  @media only screen and (min-width: 1366px) {
    height: 650px;
  }
`

const HeroImageMobile = styled.img`
  max-width: 100%;

  @media only screen and (min-width: 1024px) {
    display: none;
  }
`

const HeroImageDesktop = styled.img`
  display: none;
  max-width: 100%;

  @media only screen and (min-width: 1024px) {
    display: block;
    position: absolute;
    right: 0;
    margin-top: 100px;
    height: 550px;
  }

  @media only screen and (min-width: 1280px) {
    margin-top: 0;
  }

  @media only screen and (min-width: 1366px) {
    height: 650px;
  }
`

const HeroVersion = styled.span<SpaceProps | ColorProps>`
  ${space}
  ${color}
`

const HeroDesktopLink = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media only screen and (min-width: 768px) {
    display: block;
  }
`

const HeroSection = () => {
  const { t } = useTranslation()
  return (
    <section>
      <Container>
        <HeroContents mx={[0, 5, 6]} my={[5, 5, 9]}>
          <Row>
            <Column width={[1, 1, 1, 1 / 2]}>
              <Box>
                <HeroTitle
                  mt={[0, 5, 9]}
                  mb={3}
                  textAlign={['center', 'left']}
                  fontSize={[4, 5, 6]}
                >
                  {t('hero.title')}
                </HeroTitle>
                <HeroSubTitle
                  mb={[5, 8, 8]}
                  textAlign={['center', 'left']}
                  color={'gray'}
                  fontSize={[2, 3]}
                  fontWeight={'normal'}
                >
                  {t('hero.subtitle')}
                </HeroSubTitle>
                <FlexBox justifyContent={['center', 'left']} mt={[0, 5, 5]}>
                  <HeroDesktopLink>
                    <DownloadButtonLinksFragment />
                    <ButtonLink
                      bg='white'
                      color='teal'
                      mx={1}
                      my={1}
                      py={2}
                      href='https://note.boostio.co'
                      onClick={(event) => {
                        event.preventDefault()
                        sendGAEvent('open-in-browser')
                        queueNavigateToGA('https://note.boostio.co')
                      }}
                    >
                      <Icon path={mdiOpenInApp} /> {t('common.openInBrowser')}
                    </ButtonLink>
                  </HeroDesktopLink>
                </FlexBox>
                <FlexBox justifyContent={['center', 'left']} mt={2}>
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
                <FlexBox>
                  <HeroVersion mx={1} my={3} color={'gray'}>
                    Currently v0.9.0 (August, 24th)
                  </HeroVersion>
                </FlexBox>
              </Box>
              <Box>
                <Text
                  as='p'
                  textAlign='center'
                  color={'gray'}
                  fontSize={[3]}
                  fontWeight={'normal'}
                >
                  Also, please join our news letters to get the latest news and
                  update notes.
                </Text>
                <SubscribeNewsLettersForm />
              </Box>
            </Column>
            <Column width={[1, 1, 1, 1 / 2]}>
              <Box>
                <HeroImageMobile src='/static/hero-mobile.png' />
                <HeroImageDesktop src='/static/hero-desktop.png' />
              </Box>
            </Column>
          </Row>
        </HeroContents>
      </Container>
    </section>
  )
}

export default HeroSection
