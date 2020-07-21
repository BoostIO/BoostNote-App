import React from 'react'
import Box from '../atoms/Box'
import Text from '../atoms/Text'
import Row from '../atoms/Row'
import Column from '../atoms/Column'
import styled from '../../lib/styled'
import { space, SpaceProps } from 'styled-system'
import { useTranslation } from 'react-i18next'
import ButtonLink from '../atoms/ButtonLink'

const Container = styled.div<SpaceProps>`
  max-width: 72em;
  margin: 0 auto;
  ${space}
`

const BoostHubTitle = styled.div`
  text-align: center;
`

const BoostHubDescription = styled.div`
  display: flex;
  margin-top: 30px;
  margin-bottom: 40px;

  p {
    margin-top: 0;
    margin-bottom: 30px;
  }
`

const FeatureList = styled.ul`
  li {
    font-size: 20px;

    + li {
      margin-top: 10px;
    }
  }

  span {
    display: inline-block;
    margin-right: 5px;
    font-weight: bold;
  }
`

const BoostHubImage = styled.img`
  width: 100%;
`

const BoostHubSection = () => {
  const { t } = useTranslation()

  return (
    <section id='boosthub'>
      <Box bg='#2c2c2c' color='#f0f0f0' pt={5} px={2}>
        <Container mt={5}>
          <Row>
            <Column width={1}>
              <BoostHubTitle>
                <Text as='h2' fontSize={[3, 4, 5]} mt={0} mb={4}>
                  🤝 {t('boostHub.title')}
                </Text>
              </BoostHubTitle>
            </Column>
          </Row>

          <BoostHubDescription>
            <Row>
              <Column width={[1, 1, 1, 1 / 2]} mb={[6, 6, 6, 0]}>
                <p>{t('boostHub.description')}</p>
                <ButtonLink
                  bg='teal'
                  color='white'
                  fontSize={1}
                  py={2}
                  href='https://boosthub.io'
                >
                  {t('common.boostHub')}
                </ButtonLink>
              </Column>
              <Column width={[1, 1, 1, 1 / 2]}>
                <FeatureList>
                  <li>
                    <span>{t('boostHub.feature1Name')}:</span>
                    {t('boostHub.feature1Detail')}
                  </li>
                  <li>
                    <span>{t('boostHub.feature2Name')}:</span>
                    {t('boostHub.feature2Detail')}
                  </li>
                  <li>
                    <span>{t('boostHub.feature3Name')}:</span>
                    {t('boostHub.feature3Detail')}
                  </li>
                  <li>
                    <span>{t('boostHub.feature4Name')}:</span>
                    {t('boostHub.feature4Detail')}
                  </li>
                </FeatureList>
              </Column>
            </Row>
          </BoostHubDescription>

          <Row>
            <Column>
              <BoostHubImage src='/static/boosthub.svg' />
            </Column>
          </Row>
        </Container>
      </Box>
    </section>
  )
}

export default BoostHubSection
