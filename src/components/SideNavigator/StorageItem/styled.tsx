import React from 'react'
import styled from '../../../lib/styled'
import { LinkProps, Link } from '../../../lib/router'

export const StyledStorageItem = styled.li`
  margin: 0;
  padding: 0;
`

export const StyledStorageItemHeader = styled.header`
  height: 26px;
  display: flex;
  align-items: center;
`

export const StyledStorageItemFolderList = styled.ul`
  padding: 0;
  list-style: none;
`

export const StyledStorageItemFolderItem = styled.li`
  display: flex;
  height: 26px;
`

export const StyledNavLink = styled(
  ({
    active,
    ...props
  }: LinkProps & {
    active: boolean
    onContextMenu?: React.MouseEventHandler<HTMLAnchorElement>
  }) => <Link {...props} />
)<{ active: boolean }>`
  display: flex;
  align-items: center;
  line-height: 26px;
  padding: 0 5px;
  text-decoration: none;
  width: 100%;
  user-select: none;
  ${({ active, theme }) =>
    active &&
    `background-color: ${theme.colors.active};
    color: ${theme.colors.inverseText};`}

  .storageIcon {
    margin-right: 4px;
  }
`
