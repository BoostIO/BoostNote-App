import React from 'react'
import styled from '../../lib/styled'
import {
  Section,
  SectionHeader,
  SectionSubtleText,
  PrimaryText
} from './styled'

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

  .about-community {
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

const AboutTab = () => {
  return (
    <div>
      <Section>
        <AboutContents>
          <div className='about-outline'>
            <SectionHeader>About</SectionHeader>
            <div className='about-outline-basic'>
              <div className='about-outline-basic-logo'>
                <img src='/static/logo_symbol.svg' />
              </div>
              <div className='about-outline-basic-info'>
                <h4>Boost Note {process.env.VERSION}</h4>
                <p>
                  An open source note-taking app made for programmers just like
                  you.
                </p>
                <p>
                  <PrimaryText href='//boostnote.io/'>
                    Official Website
                  </PrimaryText>
                  <PrimaryText href='//boostnote.io/wiki/'>
                    Boost Note for Team
                  </PrimaryText>
                  {/* <PrimaryText href='github.com/BoostIO/BoostNote.next/blob/master/docs/build.md'>Development: Development configuration for Boostnote</PrimaryText> */}
                </p>
              </div>
            </div>
            <SectionSubtleText className='about-outline-copy'>
              Copyright (C) 2017 - 2019 BoostIO
              <br />
              License: GPL v3
            </SectionSubtleText>
          </div>
          <div className='about-community'>
            <SectionHeader>Community</SectionHeader>
            <div className='about-community-links'>
              <ul>
                <li>
                  <PrimaryText href='//issuehunt.io/r/BoostIo/Boostnote'>
                    Bounty on IssueHunt
                  </PrimaryText>
                </li>
                <li>
                  <PrimaryText href='//github.com/BoostIO/BoostNote.next'>
                    GitHub
                  </PrimaryText>
                </li>
                <li>
                  <PrimaryText href='//medium.com/boostnote'>Blog</PrimaryText>
                </li>
              </ul>
              <ul>
                <li>
                  <PrimaryText href='//boostnote-group.slack.com/join/shared_invite/enQtMzkxOTk4ODkyNzc0LWQxZTQwNjBlMDI4YjkyYjg2MTRiZGJhNzA1YjQ5ODA5M2M0M2NlMjI5YjhiYWQzNzgzYmU0MDMwOTlmZmZmMGE'>
                    Slack Group
                  </PrimaryText>
                </li>
                <li>
                  <PrimaryText href='//twitter.com/boostnoteapp'>
                    Twitter Account
                  </PrimaryText>
                </li>
                <li>
                  <PrimaryText href='//www.facebook.com/groups/boostnote/'>
                    Facebook Group
                  </PrimaryText>
                </li>
                <li>
                  <PrimaryText href='//www.reddit.com/r/Boostnote/'>
                    Reddit
                  </PrimaryText>
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
