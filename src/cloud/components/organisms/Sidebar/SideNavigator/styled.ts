import {
  baseIconStyle,
  sidebarText,
} from '../../../../lib/styled/styleFunctions'
import styled, { loadingColorKeyframe } from '../../../../lib/styled'

export const SideNavFolderItemStyle = styled.div`
  border-radius: 3px;
  &.dragged-over0 {
    .dragged-over0 {
      border-color: ${({ theme }) => theme.primaryBackgroundColor};
    }
    background-color: ${({ theme }) => theme.primaryBackgroundColor} !important;
  }
`
export const SideNavItemStyle = styled.div`
  border-radius: 3px;
  position: relative;
  user-select: none;
  height: 28px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;

  &:not(.dragged-over0)&.dragged-over {
    div a div svg {
      color: ${({ theme }) => theme.primaryBackgroundColor};
    }
  }

  &.dragged-over-1 {
    border-top-color: ${({ theme }) => theme.primaryBackgroundColor};
  }

  &.dragged-over1 {
    border-bottom-color: ${({ theme }) => theme.primaryBackgroundColor};
  }

  &.sidebar-header {
    margin-top: ${({ theme }) => theme.space.xsmall}px;

    a {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      padding-left: ${({ theme }) => theme.space.xsmall}px;
      text-decoration: none;
      &:focus {
        background-color: transparent;
      }
    }
  }

  .sideNavWrapper {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    min-width: 0;

    .itemLink {
      flex: 1 1 auto;
      text-decoration: none;
      box-sizing: border-box;
      width: 100%;
      line-height: 28px;
      transition: 0.2s;
      display: flex;
      align-items: center;

      svg {
        vertical-align: text-top;
      }
    }
  }

  transition: 200ms background-color;

  &:not(.non-hover) {
    &:hover,
    &:active,
    &.active,
    &:focus,
    &.focused {
      cursor: pointer;
    }
    &:hover {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }
    &:active,
    &.active,
    &:focus,
    &.focused {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }
    &.active {
      button > span {
        ${sidebarText}
      }

      span + div {
        color: ${({ theme }) => theme.emphasizedTextColor};
      }
    }
  }

  .controls {
    min-width: 0;
    display: none;
    flex: 0 0 auto;
  }
  &:hover .controls,
  &.focused .controls,
  .controls.always {
    display: flex;
    align-items: baseline;
  }
  &.bookmark-sidenav {
    padding-left: ${({ theme }) => theme.space.xxsmall}px !important;
    margin-bottom: ${({ theme }) => theme.space.default}px;
    button {
      padding-left: ${({ theme }) => theme.space.xxsmall}px !important;
    }
  }

  .label {
    font-size: ${({ theme }) => theme.fontSizes.small}px !important;
    padding-left: 5px;
    color: ${({ theme }) => theme.baseTextColor} !important;
  }

  .date-label {
    flex: 2 2 20px;
    min-width: 0;
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
    color: ${({ theme }) => theme.subtleTextColor};
    font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
    line-height: 21px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    vertical-align: text-top;
  }

  &.pl-2 {
    padding-left: ${({ theme }) => theme.space.xxsmall}px;
  }
`

export const SideNavFoldButtonStyle = styled.button`
  flex: 0 0 auto;
  position: absolute;
  width: 20px;
  height: 24px;
  padding: 0;
  border: none;
  background-color: transparent;
  border-radius: 2px;
  cursor: pointer;
  ${baseIconStyle}
  &:focus {
    box-shadow: none;
  }
`

export const SideNavClickableButtonStyle = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1 1 auto;
  width: 100%;

  a {
    padding: 0;
    background-color: transparent;
    border: none;
    min-width: 0;
    width: 100%;
    flex: 1 1 auto;
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    cursor: pointer;
    ${sidebarText}

    .icon {
      flex: 0 0 auto;
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }

  &.placeholder a {
    transition: color 0.3s linear;
    animation: ${loadingColorKeyframe} 4s linear infinite;
  }
`

export const SideNavLabelStyle = styled.div`
  min-width: 30px;
  overflow: hidden;
  white-space: nowrap !important;
  vertical-align: middle;
  flex-shrink: 2;
  flex-grow: 1;
  flex-basis: auto;
  text-align: left;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
`

export const StyledNavTagsList = styled.div`
  flex: 20 1 auto;
  height: 20px;
  overflow: hidden;

  .wrapper {
    display: flex;
    overflow-y: auto;
    overflow-x: scroll;
    padding-bottom: 10px;
  }
`

export const SideNavControlStyle = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
  padding-left: ${({ theme }) => theme.space.xxsmall}px;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  flex-shrink: 0;

  &.show-tooltip {
    overflow: visible;
  }

  button {
    display: flex;
    padding: 0 ${({ theme }) => theme.space.xxsmall}px;
    font-size: inherit;
    ${baseIconStyle}

    svg {
      height: fill-available;
      font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;
      vertical-align: middle;
    }
  }
`

export const SideNavIconStyle = styled.div`
  height: 28px;
  display: flex;
  align-items: center;
  width: 20px;
  text-align: center;
  border-radius: 2px;
  line-height: 0px;
  margin-right: ${({ theme }) => theme.space.xxsmall}px;
  justify-content: center;

  &.emoji-icon {
    flex-shrink: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.subtleBackgroundColor};
  }

  .tooltip-base {
    line-height: ${({ theme }) => theme.fontSizes.medium}px;
  }
`
