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
  margin-bottom: 20px;
  text-align: center;

  p {
    margin: 5px 0;
  }

  a {
    margin-top: 40px;
  }
`

const FeatureList = styled.div`
  span {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
  }

  @media only screen and (min-width: 1024px) {
    margin-bottom: 30px;
  }
`

const BoostHubImage = styled.img`
  width: 100%;
`

const BoostHubSection = () => {
  const { t } = useTranslation()

  return (
    <section id='boosthub'>
      <Box bg='#2c2c2c' color='#f0f0f0' px={2}>
        <Container py={9}>
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
              <Column width={1} mb={[6, 6, 6, 0]}>
                <p>{t('boostHub.description1')}</p>
                <p>{t('boostHub.description2')}</p>
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
            </Row>
          </BoostHubDescription>

          <Row>
            <Column>
              <BoostHubImage src='/static/boosthub.png' />
            </Column>
          </Row>

          <FeatureList>
            <Row>
              <Column width={[1, 1, 1, 1 / 3]} px={[3, 3, 5]} py={[3, 3, 0]}>
                <span>{t('boostHub.feature1Name')}</span>
                {t('boostHub.feature1Detail')}
              </Column>
              <Column width={[1, 1, 1, 1 / 3]} px={[3, 3, 5]} py={[3, 3, 0]}>
                <span>{t('boostHub.feature2Name')}</span>
                {t('boostHub.feature2Detail')}
              </Column>
              <Column width={[1, 1, 1, 1 / 3]} px={[3, 3, 5]} py={[3, 3, 0]}>
                <span>{t('boostHub.feature3Name')}</span>
                {t('boostHub.feature3Detail')}
              </Column>
            </Row>
          </FeatureList>
        </Container>
      </Box>
    </section>
  )
}

export default BoostHubSection
