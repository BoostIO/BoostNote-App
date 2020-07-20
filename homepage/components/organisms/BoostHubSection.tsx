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

const FeatureList = styled.ul`
  margin-top: 40px;
  margin-bottom: 40px;
  list-style: inside;
`

const BoostHubImage = styled.img`
  width: 100%;
`

const BoostHubSection = () => {
  const { t } = useTranslation()

  return (
    <section>
      <Box bg='#2c2c2c' color='#f0f0f0' py={5} px={2}>
        <Container my={5}>
          <Row>
            <Column width={[1, 1, 1, 1 / 2]} mb={[6, 6, 6, 0]}>
              <Text as='h2' fontSize={[3, 4, 5]} mt={0} mb={4}>
                🤝 {t('boostHub.title')}
              </Text>
              <p>{t('boostHub.description')}</p>

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
              <BoostHubImage src='/static/boosthub.svg' />
            </Column>
          </Row>
        </Container>
      </Box>
    </section>
  )
}

export default BoostHubSection
