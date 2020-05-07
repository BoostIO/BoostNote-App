import React from 'react'
import Box from '../atoms/Box'
import Text from '../atoms/Text'
import Row from '../atoms/Row'
import Column from '../atoms/Column'
import styled from '../../lib/styled'
import { space, SpaceProps } from 'styled-system'
import BoosthubBetaForm from '../molecules/BoosthubBetaForm'
import { useTranslation } from 'react-i18next'

const Container = styled.div<SpaceProps>`
  max-width: 72em;
  margin: 0 auto;
  ${space}
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
            <Column width={[1, 1, 1, 1 / 2]}>
              <Text as='h2' fontSize={4} my={4}>
                🤝 {t('boostHub.title')}
              </Text>
              <p>{t('boostHub.description1')}</p>

              <p>{t('boostHub.description2')}</p>

              <BoosthubBetaForm />
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
