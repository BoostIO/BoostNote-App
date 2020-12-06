import { Meta } from '@storybook/react/types-6-0'

import { FormPrimaryButton } from '../components/atoms/form'
import { createThemedTemplate } from './utils/themes'

const { Template, themeArgType } = createThemedTemplate(FormPrimaryButton)

export default {
  title: 'Legacy/Atoms/FormPrimaryButton',
  component: FormPrimaryButton,
  argTypes: {
    theme: themeArgType,
  },
} as Meta

export const Primary = Template.bind({})
Primary.args = {
  children: 'Button',
}
