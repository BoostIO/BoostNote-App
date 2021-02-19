import { BaseTheme } from './themes/types'

export interface StyledProps {
  theme: BaseTheme
}

/* ———————————–———————————–———————————–——–——
    Text
———————————–———————————–———————————–——–—— */

export const linkText = ({ theme }: StyledProps) => `
  transition: 200ms color;
  color: ${theme.baseTextColor};

  &:hover, &:focus, &:active, &.active {
    color: ${theme.emphasizedTextColor};
  }

  &:disabled {
    color: ${theme.subtleTextColor};
  }
`

export const sidebarText = ({ theme }: StyledProps) => `
  color: ${theme.baseTextColor};

  &.active {
    color: ${theme.emphasizedTextColor};
  }
`

export const tooltipText = ({ theme }: StyledProps) => `
  position: absolute;
  right: 20px;
  padding: 2px 0;
  border: 1px solid ${theme.emphasizedBackgroundColor};
  border-radius: 2px;
  color: ${theme.subtleTextColor};
  text-align: center;
`

/* ———————————–———————————–———————————–——–——
    Icon
———————————–———————————–———————————–——–—— */

export const baseIconStyle = ({ theme }: StyledProps) => `
  transition: 200ms color;
  color: ${theme.baseIconColor};
  font-size: ${theme.fontSizes.large}px;

  &:hover, &:active, &:focus {
    color: ${theme.emphasizedIconColor} !important;
  }

  &:disabled {
    &:hover, &:focus {
      cursor: not-allowed;
    }
  }
`

export const userIconStyle = ({ theme }: StyledProps) => `
  display: flex;
  justify-content: center;
  margin-right: ${theme.space.xxsmall * -1}px;
  background-color: ${theme.baseBackgroundColor};
  border: 1px solid transparent;
  border-radius: 100%;
  color: ${theme.primaryTextColor};
  line-height: 24px;
  overflow: hidden;
  text-align: center;

  img,
  .icon {
    width: 100%;
    height: 100%;
    border-radius: 100%;
    object-fit: cover;
  }
`

/* ———————————–———————————–———————————–——–——
    Spaces
———————————–———————————–———————————–——–—— */

export const paddingLeftMedium = ({ theme }: StyledProps) => `
  padding-left: ${theme.space.medium}px;
`

/* ———————————–———————————–———————————–——–——
    Background
———————————–———————————–———————————–——–—— */

export const baseBackgroundColor = ({ theme }: StyledProps) => `
  background-color: ${theme.baseBackgroundColor};
`

export const secondaryBackgroundColor = ({ theme }: StyledProps) => `
  background-color: ${theme.secondaryBackgroundColor};
`

export const subtleBackgroundColor = ({ theme }: StyledProps) => `
  background-color: ${theme.subtleBackgroundColor};
`

export const emphasizedBackgroundColor = ({ theme }: StyledProps) => `
  background-color: ${theme.emphasizedBackgroundColor};
`

/* ———————————–———————————–———————————–——–——
    Border
———————————–———————————–———————————–——–—— */

export const baseBorderColor = ({ theme }: StyledProps) => `
  border-color: ${theme.baseBorderColor};
`

export const subtleBorderColor = ({ theme }: StyledProps) => `
  border-color: ${theme.subtleBorderColor};
`

/* ———————————–———————————–———————————–——–——
    Shadow
———————————–———————————–———————————–——–—— */

export const baseShadowColor = ({ theme }: StyledProps) => `
  box-shadow: ${theme.baseShadowColor};
`

/* ———————————–———————————–———————————–——–——
    Button
———————————–———————————–———————————–——–—— */

export const baseButtonStyle = ({ theme }: StyledProps) => `
  padding: 0 ${theme.space.default}px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: ${theme.fontSizes.small}px;
  line-height: 40px;
  outline: 0;

  &:disabled {
    cursor: not-allowed;
    opacity: .5;
  }
`

export const primaryButtonStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.primaryBackgroundColor};
  color: ${theme.whiteTextColor};

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.darkerPrimaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkPrimaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const lpBaseButtonStyle = ({ theme }: StyledProps) => `
  display: inline-block;
  border-radius: 2px;
  padding: 12px 24px;
  height: 50px;
  border: solid 1px ${theme.subtleTextColor};
  font-family: SFMono-Regular, Consolas, Liberation, Mono, Menlo, monospace;
  font-size: ${theme.lp.fontSizes[1]}px;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.subtleBackgroundColor};
    color: ${theme.baseTextColor};
    cursor: pointer;
    transform: translateY(-3px);
    transition: 0.2s cubic-bezier(0, 0, 0.25, 1);
  }
  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`

export const lpPrimaryButtonStyle = ({ theme }: StyledProps) => `
  border: 2px solid ${theme.lpPrimaryBackgroundColor};
  background-color: ${theme.lpPrimaryBackgroundColor};
  color: ${theme.whiteTextColor};
  transition: 0.2s;
  height: 50px;

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.darkerLpPrimaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkLpPrimaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const lpOutlinePrimaryButtonStyle = ({ theme }: StyledProps) => `
  border: 2px solid transparent;
  transition: 0.2s;
  height: 50px;

  &:hover:not(:disabled), &:focus {
    border-color: ${theme.darkerLpPrimaryBackgroundColor};
  }

  &:active, &.active {
    border-color: ${theme.darkLpPrimaryBackgroundColor};
  }
`

export const lpInversePrimaryButtonStyle = ({ theme }: StyledProps) => `
  border: 2px solid ${theme.lpPrimaryBackgroundColor};
  color: ${theme.lpPrimaryTextColor};
  transition: 0.2s;
  height: 50px;

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.lpPrimaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.lpPrimaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const secondaryButtonStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.secondaryBackgroundColor};
  color: ${theme.whiteTextColor};

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.darkerSecondaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkSecondaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const inverseSecondaryButtonStyle = ({ theme }: StyledProps) => `
  background-color: transparent;
  border: 1px solid ${theme.secondaryBorderColor};
  color: ${theme.baseTextColor};
  font-size: ${theme.fontSizes.small}px;

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.secondaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkerSecondaryBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const dangerButtonStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.dangerBackgroundColor};
  color: ${theme.whiteTextColor};

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.darkerDangerBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkDangerBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const warningButtonStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.warningBackgroundColor};
  color: ${theme.whiteTextColor};

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.darkerWarningBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkWarningBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const infoButtonStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.infoBackgroundColor};
  color: ${theme.whiteTextColor};

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.darkerInfoBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkInfoBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const blueButtonStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.blueBackgroundColor};
  color: ${theme.whiteTextColor};

  &:hover:not(:disabled), &:focus {
    background-color: ${theme.darkerBlueBackgroundColor};
    color: ${theme.whiteTextColor};
  }

  &:active, &.active {
    background-color: ${theme.darkBlueBackgroundColor};
    color: ${theme.whiteTextColor};
  }
`

export const transparentButtonStyle = ({ theme }: StyledProps) => `
  background-color: transparent;
  color: ${theme.subtleTextColor};
  font-size: ${theme.fontSizes.small}px;

  &:hover:not(:disabled), &:focus {
    color: ${theme.emphasizedTextColor};
  }

  &:active, &.active {
    color: ${theme.primaryTextColor};
  }
`

export const sidebarButtonStyle = ({ theme }: StyledProps) => `
  transition: 200ms color;
  flex: 0 0 auto;
  width: 100%;
  padding: 0 ${theme.space.xsmall}px;
  background: none;
  color: ${theme.baseTextColor};
  cursor: pointer;
  font-size: ${theme.fontSizes.small}px;
  line-height: 36px;
  text-align: left;

  svg {
    margin-right: ${theme.space.xxsmall}px;
    color: ${theme.baseIconColor};
    font-size: ${theme.fontSizes.large}px;
    vertical-align: text-bottom;
  }

  &.active, &:hover, &:focus {
    background-color: ${theme.emphasizedBackgroundColor};
  }

  &.active {
    color: ${theme.emphasizedTextColor};

    svg {
      color: ${theme.emphasizedIconColor};
    }
  }

  &:disabled {
    color: ${theme.subtleTextColor};
    cursor: not-allowed;

    &:hover, &:focus {
      background-color: transparent;
      cursor: not-allowed;

      svg {
        color: ${theme.subtleTextColor};
      }
    }
  }
`

export const teamPickerButtonStyle = ({ theme }: StyledProps) => `
  transition: 200ms color;
  flex: 0 0 auto;
  width: 100%;
  padding: ${theme.space.xxsmall}px ${theme.space.small}px;
  background: none;
  color: ${theme.subtleTextColor};
  cursor: pointer;
  font-size: ${theme.fontSizes.small}px;
  line-height: 30px;
  text-align: left;

  svg {
    margin-right: ${theme.space.xxsmall}px;
    color: ${theme.baseIconColor};
    font-size: ${theme.fontSizes.large}px;
    vertical-align: text-bottom;
  }

  &:hover, &.active {
    background-color: ${theme.subtleBackgroundColor};
    color: ${theme.emphasizedTextColor};
    svg {
      color: ${theme.emphasizedIconColor};
    }
  }

  &:disabled {
    color: ${theme.subtleTextColor};
    cursor: not-allowed;

    &:hover, &:focus {
      background-color: transparent;
      cursor: not-allowed;

      svg {
        color: ${theme.subtleTextColor};
      }
    }
  }
`

export const topbarIconButtonStyle = ({ theme }: StyledProps) => `
  display: flex;
  align-items: center;
  padding: ${theme.space.xxsmall}px;
  background: none;
  border: 0;
  border-radius: 3px;
  transition: 0.1s cubic-bezier(0, 0, 0.25, 1);
  color: ${theme.subtleTextColor};

  &:hover,
  &:focus,
  &.active,
  &:active {
    color: ${theme.emphasizedTextColor};
  }

  &:hover,
  &:focus {
    background-color: ${theme.subtleBackgroundColor};
  }
`

/* ———————————–———————————–———————————–——–——
    Form
———————————–———————————–———————————–——–—— */

export const inputStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.subtleBackgroundColor};
  border: none;
  border-radius: 2px;
  color: ${theme.emphasizedTextColor};

  &:focus {
    box-shadow: 0 0 0 2px ${theme.primaryBorderColor};
  }
`

export const selectStyle = ({ theme }: StyledProps) => `
  background-color: ${theme.subtleBackgroundColor};
  border: ${theme.baseBorderColor};
  color: ${theme.emphasizedTextColor};

  &:focus {
    box-shadow: 0 0 0 2px ${theme.primaryBorderColor};
  }
`

export const borderedInputStyle = ({ theme }: StyledProps) => `
  background: none;
  border: 1px solid ${theme.subtleBackgroundColor};
  padding: 0 ${theme.space.small}px;
  border-radius: 2px;
  color: ${theme.emphasizedTextColor};

  &:focus {
    box-shadow: 0 0 0 2px ${theme.primaryBorderColor};
  }
`

/* ———————————–———————————–———————————–——–——
    Table
———————————–———————————–———————————–——–—— */

export const tableStyle = ({ theme }: StyledProps) => `
  width: 100%;
  border: 1px solid ${theme.baseBorderColor};
  border-collapse: collapse;
  color: ${theme.emphasizedTextColor};
  text-align: left;

  th, td {
    padding: ${theme.space.xsmall}px ${theme.space.small}px;
    border: 1px solid ${theme.baseBorderColor};
    font-weight: 400;
  }

  thead th {
    font-size: ${theme.fontSizes.large}px;
    font-weight: 500;

    span {
      display: block;
    }
  }

  tbody td {
    text-align: center;
  }
`

/* ———————————–———————————–———————————–——–——
    Responsive Styles
———————————–———————————–———————————–——–—— */

export const fromMobile = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.mobile}px
`

export const fromTablet = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.tablet}px
`

export const fromLaptop = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.laptop}px
`

export const fromDesktop = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.desktop}px
`

export const underMobile = ({ theme }: StyledProps) => `
  max-width: ${theme.breakpoints.mobile}px
`

export const underTablet = ({ theme }: StyledProps) => `
  max-width: ${theme.breakpoints.tablet}px
`

export const rightSidePageLayout = () => `
  width: 100%;
  max-width: 920px;
`
