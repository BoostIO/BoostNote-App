import React from 'react'
import styled from '../../lib/styled'
import Container from '../atoms/Container'
import { useTranslation } from 'react-i18next'
import Box from '../atoms/Box'
import FlexBox from '../atoms/FlexBox'
import Text from '../atoms/Text'

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

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer>
      <Box bg='#f0f0f0'>
        <Container py={4}>
          <FooterNavigator>
            <FlexBox as='ul' flexWrap='wrap' mb={4}>
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
                <a href='/backers'>{t('footer.backers')}</a>
              </li>
              <li>
                <a href='/terms'>{t('footer.userTerms')}</a>
              </li>
              <li>
                <a href='/privacy'>{t('footer.privacyPolicy')}</a>
              </li>
            </FlexBox>
            <Text textAlign='center'>© 2016 - 2020 BoostIO</Text>
          </FooterNavigator>
        </Container>
      </Box>
    </footer>
  )
}

export default Footer
