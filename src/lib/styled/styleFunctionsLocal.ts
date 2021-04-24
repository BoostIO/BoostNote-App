import styled from '../../shared/lib/styled'
import { StyledProps } from '../../shared/lib/styled/styleFunctions'
import { loadingColorKeyframe } from '../../cloud/lib/styled'

export const baseIconStyle = ({ theme }: StyledProps) => `
  transition: 200ms color;
  color: ${theme.colors.icon.default};
  font-size: ${theme.sizes.fonts.l}px;

  &:hover, &:active, &:focus {
    color: ${theme.colors.icon.active} !important;
  }

  &:disabled {
    &:hover, &:focus {
      cursor: not-allowed;
    }
  }
`

export const sidebarText = ({ theme }: StyledProps) => `
  color: ${theme.colors.text.primary};

  &.active {
    color: ${theme.colors.text.link};
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
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    cursor: pointer;
    ${sidebarText}

    .icon {
      flex: 0 0 auto;
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }

  &.placeholder a {
    transition: color 0.3s linear;
    animation: ${loadingColorKeyframe} 4s linear infinite;
  }
`

export const SideNavControlStyle = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
  padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  flex-shrink: 0;

  &.show-tooltip {
    overflow: visible;
  }

  button {
    display: flex;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
    font-size: inherit;
    ${baseIconStyle};

    svg {
      height: fill-available;
      font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
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
  margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  justify-content: center;

  &.emoji-icon {
    flex-shrink: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }

  .tooltip-base {
    line-height: ${({ theme }) => theme.sizes.fonts.md}px;
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
      color: ${({ theme }) => theme.colors.background.primary};
    }
  }

  &.dragged-over-1 {
    border-top-color: ${({ theme }) => theme.colors.background.primary};
  }

  &.dragged-over1 {
    border-bottom-color: ${({ theme }) => theme.colors.background.primary};
  }

  &.sidebar-header {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;

    a {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
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
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
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
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
    &:active,
    &.active,
    &:focus,
    &.focused {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }
    &.active {
      button > span {
        ${sidebarText}
      }

      span + div {
        color: ${({ theme }) => theme.colors.text.link};
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
    padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px !important;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    button {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px !important;
    }
  }

  .label {
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px !important;
    padding-left: 5px;
    color: ${({ theme }) => theme.colors.text.primary} !important;
  }

  .date-label {
    flex: 2 2 20px;
    min-width: 0;
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    line-height: 21px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    vertical-align: text-top;
  }

  &.pl-2 {
    padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
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
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
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

export const subtleBackgroundColor = ({ theme }: StyledProps) => `
  background-color: ${theme.colors.background.tertiary};
`

export const StyledTag = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 2px 5px;
  ${subtleBackgroundColor};
  position: relative;
  margin: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  border-radius: 3px;
  vertical-align: middle;
  height: 25px;
  line-height: 20px;

  &.toolbar-tag {
    align-items: center;
  }

  .removeTag {
    display: inline-block;
    cursor: pointer;
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.link};
    }

    &disabled {
      pointer-events: none;
    }
  }

  .tag-link {
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;
    &:hover,
    &:focus {
      opacity: 0.8;
    }
  }

  .tag-spinner {
    margin-top: -3px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  &.bg-none {
    background: none;
  }

  &.mb-0 {
    margin-bottom: 0;
  }

  &.size-s {
    height: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.xsm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    line-height: 1;
  }

  &.ml-xsmall {
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

/* ———————————–———————————–———————————–——–——
    Text
———————————–———————————–———————————–——–—— */
export const linkText = ({ theme }: StyledProps) => `
  transition: 200ms color;
  color: ${theme.colors.text.primary};

  &:hover, &:focus, &:active, &.active {
    color: ${theme.colors.text.link};
  }

  &:disabled {
    color: ${theme.colors.text.subtle};
  }
`
