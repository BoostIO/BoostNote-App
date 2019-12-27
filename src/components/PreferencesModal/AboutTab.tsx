import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import {
  Section,
  SectionHeader,
  SectionSubtleText,
  PrimaryAnchor
} from './styled'
import { openNew } from '../../lib/utils/platform'
import Image from '../atoms/Image'
import AppLink from '../atoms/AppLink'
import { useTranslation } from 'react-i18next'

const AboutContents = styled.div`
  max-width: 360px;
  font-size: 13px;

  a {
    display: inline-block;
    + a {
      margin-left: 20px;
    }
    &:hover {
      text-decoration: none;
    }
  }

  .about-outline-basic {
    display: flex;
    align-items: flex-start;
    margin-top: 24px;
  }
  .about-outline-basic-logo {
    img {
      width: 63px;
    }
  }
  .about-outline-basic-info {
    margin-left: 16px;

    h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.15;

      + p {
        margin-bottom: 0;
        font-size: 10px;
      }
    }
  }
  .about-outline-copy {
    font-size: 10px;
    text-align: right;
  }

  .about-community,
  .about-platform {
    margin-top: 40px;
  }

  .about-community-links {
    display: flex;

    ul {
      width: 50%;
      padding-left: 0;
      list-style: none;

      li {
        + li {
          margin-top: 20px;
        }
      }
    }
  }
`

interface PrimaryLinkProps {
  href: string
  children: string
}

const PrimaryLink = ({ href, children }: PrimaryLinkProps) => {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      openNew(href)
    },
    [href]
  )

  return (
    <PrimaryAnchor href={href} onClick={handleClick}>
      {children}
    </PrimaryAnchor>
  )
}

const AboutTab = () => {
  const { t } = useTranslation()

  return (
    <div>
      <Section>
        <AboutContents>
          <div className='about-outline'>
            <SectionHeader>{t('about.about')}</SectionHeader>
            <div className='about-outline-basic'>
              <div className='about-outline-basic-logo'>
                <Image src={'/app/static/logo.svg'} />
              </div>
              <div className='about-outline-basic-info'>
                <h4>Boost Note {process.env.VERSION}</h4>
                <p>{t('about.boostnoteDescription')}</p>
                <p>
                  <PrimaryLink href='https://boostnote.io/'>
                    {t('about.website')}
                  </PrimaryLink>
                  <PrimaryLink href='https://boostnote.io/wiki/'>
                    {t('about.boostWiki')}
                  </PrimaryLink>
                </p>
              </div>
            </div>
            <SectionSubtleText className='about-outline-copy'>
              Copyright (C) 2017 - 2019 BoostIO
              <br />
              License: GPL v3
            </SectionSubtleText>
          </div>
          <div className='about-platform'>
            <SectionHeader>{t('about.platform')}</SectionHeader>
            <AppLink />
          </div>
          <div className='about-community'>
            <SectionHeader>{t('about.community')}</SectionHeader>
            <div className='about-community-links'>
              <ul>
                <li>
                  <PrimaryLink href='https://github.com/BoostIO/BoostNote.next'>
                    {t('about.github')}
                  </PrimaryLink>
                </li>
                <li>
                  <PrimaryLink href='https://github.com/BoostIO/BoostNote.next'>
                    {t('about.bounty')}
                  </PrimaryLink>
                </li>
                <li>
                  <PrimaryLink href='https://medium.com/boostnote'>
                    {t('about.blog')}
                  </PrimaryLink>
                </li>
              </ul>
              <ul>
                <li>
                  <PrimaryLink href='https://boostnote-group.slack.com/join/shared_invite/enQtMzkxOTk4ODkyNzc0LWQxZTQwNjBlMDI4YjkyYjg2MTRiZGJhNzA1YjQ5ODA5M2M0M2NlMjI5YjhiYWQzNzgzYmU0MDMwOTlmZmZmMGE'>
                    {t('about.slack')}
                  </PrimaryLink>
                </li>
                <li>
                  <PrimaryLink href='https://twitter.com/boostnoteapp'>
                    {t('about.twitter')}
                  </PrimaryLink>
                </li>
                <li>
                  <PrimaryLink href='https://www.facebook.com/groups/boostnote/'>
                    {t('about.facebook')}
                  </PrimaryLink>
                </li>
                <li>
                  <PrimaryLink href='https://www.reddit.com/r/Boostnote/'>
                    {t('about.reddit')}
                  </PrimaryLink>
                </li>
              </ul>
            </div>
          </div>
        </AboutContents>
      </Section>
    </div>
  )
}

export default AboutTab
