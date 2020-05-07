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
        <Text fontSize={5} mr={2} lineHeight={0}>
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
  return (
    <section>
      <Box py={4} bg='#f0f0f0'>
        <Text as='h2' fontSize={4} my={4} textAlign='center'>
          ⚡ Features
        </Text>
        <FlexBox justifyContent='center' mx={2} mb={5}>
          <ul>
            <FeatureListItem
              iconPath={mdiCloudSync}
              title='Cloud Storage'
              description='Notes in a cloud storage will be stored safely and accessible from other devices.'
            />
            <FeatureListItem
              iconPath={mdiCellphoneLink}
              title='Multiple Devices'
              description='Boost Note app is available in browsers, desktop app and mobile app.'
            />
            <FeatureListItem
              iconPath={mdiCodeNotEqualVariant}
              title='Syntax Highlight'
              description='Boost Note can highlight more than 100 programming languages.'
            />
            <FeatureListItem
              iconPath={mdiFunctionVariant}
              title='Math Equations'
              description='Boost Note supports math blocks. In the blocks, you can write math equations with LaTeX syntax.'
            />
            <FeatureListItem
              iconPath={mdiPalette}
              title='Customizable Theme'
              description='You can customize style of the app UI, its editor and rendered markdown contents.'
            />
            <FeatureListItem
              iconPath={mdiHarddisk}
              title='File System Based Storage (Coming Soon)'
              description='You can have full control of your data. Share your notes with your favorite cloud storage service.'
            />
            <FeatureListItem
              iconPath={mdiLanguageMarkdown}
              title='Extensible Markdown (Coming Soon)'
              description='You can introduce custom markdown syntax and configure how to render it.'
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
