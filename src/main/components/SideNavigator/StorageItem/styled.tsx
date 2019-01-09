import React from 'react'
import styled from '../../../styled'
import { Link, LinkProps } from 'react-router-dom'

export const StyledStorageItem = styled.li`
  margin: 0;
  padding: 0;
`

export const StyledStorageItemHeader = styled.header`
  height: 30px;
  display: flex;
`

export const StyledStorageItemFolderList = styled.ul`
  padding: 0;
  list-style: none;
`

export const StyledStorageItemFolderItem = styled.li`
  display: flex;
  height: 30px;
`

export const StyledNavLink = styled(
  ({ active, ...props }: LinkProps & { active: boolean }) => <Link {...props} />
)<{ active: boolean }>`
  line-height: 30px;
  padding: 0 5px;
  text-decoration: none;
  width: 100%;
  ${({ active, theme }) =>
    active && `background-color: ${theme.sideNav.linkActiveBackgroundColor};`}
`
