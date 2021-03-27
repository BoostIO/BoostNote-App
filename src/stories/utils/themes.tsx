import React, { FC, PropsWithChildren, ComponentType } from 'react'
import { Story } from '@storybook/react/types-6-0'
import { ThemeProvider } from 'styled-components'
import { ThemeTypes, selectTheme } from '../../themes/v2'
import styled from '../../lib/styled'

interface ThemedWrapperProps {
  theme?: ThemeTypes
}

export const ThemedWrapper: FC<ThemedWrapperProps> = ({
  theme = 'dark',
  children,
}) => {
  return (
    <ThemeProvider theme={selectTheme(theme)}>
      <StyledBackground>{children}</StyledBackground>
    </ThemeProvider>
  )
}

const StyledBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px;
  background-color: ${({ theme }) => theme.backgroundColor};
  box-sizing: border-box;
`

export type ThemedStory<P> = Story<{ theme: ThemeTypes } & PropsWithChildren<P>>

export function createThemedTemplate<P = {}>(
  Component: ComponentType<P>
): {
  Template: ThemedStory<P>
  themeArgType: {}
} {
  return {
    Template: ({ theme, ...args }: any) => {
      return (
        <ThemedWrapper theme={theme}>
          <Component {...args} />
        </ThemedWrapper>
      )
    },
    themeArgType: {
      defaultValue: 'dark',
      control: {
        type: 'inline-radio',
        options: ['light', 'dark'],
      },
    },
  }
}
