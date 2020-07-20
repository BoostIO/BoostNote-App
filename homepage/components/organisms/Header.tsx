import React from 'react'
import styled from '../../lib/styled'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import ButtonLink from '../atoms/ButtonLink'
import { useEffectOnce } from 'react-use'
import Container from '../atoms/Container'
import HomeLogoLink from '../atoms/HomeLogoLink'
import {
  layout,
  LayoutProps,
  space,
  SpaceProps,
  flex,
  FlexProps,
} from 'styled-system'
import Icon from '../atoms/Icon'
import { mdiDownload, mdiOpenInApp } from '@mdi/js'
import { sendGAEvent, queueNavigateToGA } from '../../lib/analytics'

const HeaderAlert = styled.div`
  background-color: #0091ad;

  p {
    margin: 0;
    padding: 15px 0;
    color: #fff;
    font-family: SFMono-Regular, Consolas, Liberation, Mono, Menlo, monospace;
    text-align: center;
  }

  span {
    font-weight: bold;
  }
`

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.9);
`

const HeaderNavigator = styled.nav<SpaceProps>`
  ${space}
  display: flex;
  align-items: center;
`
const HeaderLogo = styled.div<FlexProps>`
  ${flex}
`

const HeaderLeftList = styled.ul<LayoutProps>`
  ${layout}
  flex: 1;
  align-items: center;
`

const HeaderLink = styled.a<SpaceProps>`
  display: inline-block;
  position: relative;
  ${space}
  white-space: nowrap;

  color: ${({ theme }) => theme.colors.black} !important;
  font-weight: bold;

  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    bottom: ${({ theme }) => theme.space[1]}px;
    width: 0;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.teal};
  }
  &:before {
    left: ${({ theme }) => theme.space[2]}px;
    -webkit-transition: width 0s ease;
    transition: width 0s ease;
  }
  &:after {
    right: ${({ theme }) => theme.space[2]}px;
    -webkit-transition: width 0.3s ease;
    transition: width 0.3s ease;
  }

  &:hover {
    &:before,
    &:after {
      width: calc(100% - ${({ theme }) => theme.space[2]}px * 2);
    }
    &:before {
      -webkit-transition: width 0.3s ease;
      transition: width 0.3s ease;
    }
    &:after {
      -webkit-transition: all 0s 0.3s ease;
      transition: all 0s 0.3s ease;
    }
  }
`

const HeaderRightList = styled.ul<LayoutProps>`
  ${layout}
  list-style: none;
  align-items: center;

  li {
    margin: 0 0.5em;
  }
`

const HeaderLanguageSelect = styled.select`
  height: 50px;
  width: 50px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  font-size: 24px;
  line-height: 50px;

  &:hover {
    cursor: pointer;
  }
  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`

const Header = () => {
  const { t, i18n } = useTranslation()

  useEffectOnce(() => {
    const language = localStorage.getItem('language')
    if (language != null) {
      i18n.changeLanguage(language)
    }
  })

  const switchLanguage = useCallback(
    (event) => {
      const language = event.target.value
      i18n.changeLanguage(language)
      localStorage.setItem('language', language)
    },
    [i18n]
  )

  return (
    <>
      <HeaderAlert>
        <p>
          <span>Boost Hub</span>, the workspace app for developer teams, has
          arrived!
        </p>
      </HeaderAlert>

      <HeaderContainer>
        <Container>
          <HeaderNavigator mx={2} py={2}>
            <HeaderLogo flex={[1, 'inherit']}>
              <HomeLogoLink />
            </HeaderLogo>
            <HeaderLeftList display={['none', 'flex']}>
              <HeaderLink p={2} mx={3} href='https://boosthub.io'>
                {t('header.forTeams')}
              </HeaderLink>
              <li style={{ height: '30px' }}>
                <iframe
                  src='https://ghbtns.com/github-btn.html?user=boostio&repo=boostnote.next&type=star&count=true&size=large'
                  frameBorder='0'
                  scrolling='0'
                  width='170'
                  height='30'
                  title='Star boostio/boostnote.next on GitHub'
                ></iframe>
              </li>
            </HeaderLeftList>
            <HeaderRightList display={['none', 'none', 'none', 'flex']}>
              <li>
                <ButtonLink
                  bg='teal'
                  color='white'
                  fontSize={1}
                  py={2}
                  href='/#download'
                >
                  <Icon path={mdiDownload} />
                  {t('common.downloadApp')}
                </ButtonLink>
              </li>
              <li>
                <ButtonLink
                  bg='white'
                  color='teal'
                  fontSize={1}
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
              </li>
            </HeaderRightList>
            <HeaderLanguageSelect
              value={i18n.language}
              onChange={switchLanguage}
            >
              <option value='de'>🇩🇪</option>
              <option value='en'>🇺🇸</option>
              <option value='es'>🇪🇸</option>
              <option value='fr'>🇫🇷</option>
              <option value='ja'>🇯🇵</option>
              <option value='ko'>🇰🇷</option>
              <option value='nl'>🇳🇱</option>
              <option value='pt'>🇵🇹</option>
              <option value='ru'>🇷🇺</option>
              <option value='vn'>🇻🇳</option>
              <option value='zh'>🇨🇳</option>
            </HeaderLanguageSelect>
          </HeaderNavigator>
        </Container>
      </HeaderContainer>
    </>
  )
}

export default Header
