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
} from '@mdi/js'

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

const FeaturesSection = () => {
  return (
    <section>
      <Box py={4}>
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
              iconPath={mdiLanguageMarkdown}
              title='Extensible Markdown (Coming Soon)'
              description='You can introduce custom markdown syntax and configure how to render it.'
            />
          </ul>
        </FlexBox>
      </Box>
    </section>
  )
}

export default FeaturesSection
