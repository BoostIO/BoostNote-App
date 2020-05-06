import React from 'react'
import styled from '../../lib/styled'
import Container from '../atoms/Container'
import { useTranslation } from 'react-i18next'
import FlexBox from '../atoms/FlexBox'

const FooterNavigator = styled.nav`
  & > ul {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > ul > li {
    margin: 0 1em;
  }
  & > ul > li > a {
    color: ${({ theme }) => theme.colors.gray} !important;

    &:hover {
      text-decoration: underline;
    }
  }
`

const CopyRight = styled.div`
  text-align: center;
`

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer>
      <Container py={4} bg='#f0f0f0'>
        <FooterNavigator>
          <FlexBox as='ul' flexWrap='wrap' my={4}>
            <li>
              <a href='https://boostio.co'>BoostIO</a>
            </li>
            <li>
              <a href='https://boostio.co/mission'>{t('footer.mission')}</a>
            </li>
            <li>
              <a
                href='https://drive.google.com/drive/folders/14uuuANci1MPfrPjQ6RClZtjE5T4twzw7?usp=sharing'
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('footer.pressKit')}
              </a>
            </li>
            <li>
              <a href='/terms'>User terms</a>
            </li>
            <li>
              <a href='/privacy'>Privacy</a>
            </li>
          </FlexBox>
          <CopyRight>© 2016 - 2020 BoostIO</CopyRight>
        </FooterNavigator>
      </Container>
    </footer>
  )
}

export default Footer
