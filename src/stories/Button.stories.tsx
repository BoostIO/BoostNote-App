import { Meta } from '@storybook/react/types-6-0'
import Button from '../components/v2/atoms/Button'
import { createThemedTemplate } from './utils/themes'

const { Template, themeArgType } = createThemedTemplate(Button)

export default {
  title: 'Legacy/Atoms/Button',
  component: Button,
  argTypes: {
    theme: themeArgType,
  },
} as Meta

export const Primary = Template.bind({})
Primary.args = {
  children: 'Label',
  variant: 'primary',
}
