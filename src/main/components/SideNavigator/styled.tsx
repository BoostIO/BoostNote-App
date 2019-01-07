import React from 'react'
import styled from '../../styled'
import { Link, LinkProps } from 'react-router-dom'

export const StyledStorageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const StyledStorageItem = styled.li`
  margin: 0;
  padding: 0;
`

export const StyledStorageItemHeader = styled.header`
  height: 30px;
  display: flex;
`

export const StyledStorageItemLink = styled(
  ({ active, ...props }: LinkProps & { active: boolean }) => <Link {...props} />
)<{ active: boolean }>`
  width: 100%;
  ${({ active, theme }) =>
    active && `background-color: ${theme.sideNav.linkActiveBackgroundColor};`}
`
