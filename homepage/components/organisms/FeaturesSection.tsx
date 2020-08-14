import React from 'react'
import Box from '../atoms/Box'
import FlexBox from '../atoms/FlexBox'
import Text from '../atoms/Text'
import Icon from '../atoms/Icon'
import {
  mdiCloudSync,
  mdiCellphoneLink,
  mdiCodeNotEqualVariant,
  mdiFunctionVariant,
  mdiPalette,
  mdiLanguageMarkdown,
  mdiHarddisk,
} from '@mdi/js'
import styled from '../../lib/styled'
import { useTranslation } from 'react-i18next'

interface FeatureListItemProps {
  iconPath: string
  title: string
  description: string
}

const FeatureListItem = ({
  iconPath,
  title,
  description,
}: FeatureListItemProps) => {
  return (
    <Box as='li'>
      <FlexBox alignItems='center'>
        <Text fontSize={[3, 4, 5]} mr={2} lineHeight={0}>
          <Icon path={iconPath} />
        </Text>
        <Text as='h4' my={0} fontSize={2}>
          {title}
        </Text>
      </FlexBox>
      <Text as='p' mt={0} mb={2}>
        {description}
      </Text>
    </Box>
  )
}

const RoadmapImage = styled.img`
  border-radius: 5px;
  max-width: 100%;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
  &:hover {
    transform: translateY(-3px);
    transition: 0.2s cubic-bezier(0, 0, 0.25, 1);
  }
`

const FeaturesSection = () => {
  const { t } = useTranslation()

  return (
    <section>
      <Box py={4} bg='#f0f0f0'>
        <Text as='h2' fontSize={[3, 4, 5]} my={4} textAlign='center'>
          ⚡ {t('features.title')}
        </Text>
        <FlexBox justifyContent='center' mx={2} mb={5}>
          <ul>
            <FeatureListItem
              iconPath={mdiCloudSync}
              title={t('features.cloudStorage')}
              description={t('features.cloudStorageDescription')}
            />
            <FeatureListItem
              iconPath={mdiCellphoneLink}
              title={t('features.multiplePlatforms')}
              description={t('features.multiplePlatformsDescription')}
            />
            <FeatureListItem
              iconPath={mdiCodeNotEqualVariant}
              title={t('features.syntaxHighlight')}
              description={t('features.syntaxHighlightDescription')}
            />
            <FeatureListItem
              iconPath={mdiFunctionVariant}
              title={t('features.mathEquations')}
              description={t('features.mathEquationsDescription')}
            />
            <FeatureListItem
              iconPath={mdiPalette}
              title={t('features.customizableTheme')}
              description={t('features.customizableThemeDescription')}
            />
            <FeatureListItem
              iconPath={mdiHarddisk}
              title={t('common.fileSystemBasedStorage')}
              description={t('features.fileSystemBasedStorageDescription')}
            />
            <FeatureListItem
              iconPath={mdiLanguageMarkdown}
              title={`${t('features.extensibleMarkdown')} (${t(
                'common.comingSoon'
              )})`}
              description={t('features.extensibleMarkdownDescription')}
            />
          </ul>
        </FlexBox>
        <Box py={4} px={2}>
          <FlexBox justifyContent='center' my={4}>
            <a
              target='_blank'
              rel='noopener noreferrer'
              href='https://medium.com/boostnote/boost-note-roadmap-2020-9f06a642f5f1'
            >
              <RoadmapImage width='600' src='/static/roadmap2020.png' />
            </a>
          </FlexBox>
        </Box>
      </Box>
    </section>
  )
}

export default FeaturesSection
