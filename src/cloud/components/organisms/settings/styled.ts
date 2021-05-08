import styled from '../../../lib/styled'
import {
  selectStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  dangerButtonStyle,
  inputStyle,
  tableStyle,
  baseIconStyle,
  baseButtonStyle,
  paddingLeftMedium,
} from '../../../lib/styled/styleFunctions'

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

export const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
`

export const Scrollable = styled.div`
  flex: 1 1 auto;
  width: 100%;
  padding: ${({ theme }) => theme.space.large}px
    ${({ theme }) => theme.space.default}px;
  overflow: hidden auto;
`

export const Section = styled.section`
  padding: ${({ theme }) => theme.space.xsmall}px 0;
`

export const AlignedRightContent = styled.div`
  text-align: right;
`

export const TabHeader = styled.h2`
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.space.xsmall}px;
  font-size: ${({ theme }) => theme.fontSizes.medium}px;
  font-weight: 500;

  &.marginTop {
    margin-top: ${({ theme }) => theme.space.xsmall}px;
  }
`

export const SectionHeader1 = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxsmall * 4}px;
  font-weight: 500;
`

export const SectionHeader2 = styled.h2`
  margin: ${({ theme }) => theme.space.medium}px 0
    ${({ theme }) => theme.space.default}px;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  font-weight: 500;
`

export const SectionHeader3 = styled.h3`
  display: inline-block;
  width: 40%;
  margin: ${({ theme }) => theme.space.default}px 0;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  font-weight: 500;
`

export const SectionSpan = styled.span`
  display: inline-block;
  width: 60%;
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
`

export const SectionHighlight = styled.span`
  color: ${({ theme }) => theme.primaryBackgroundColor};
`

export const SectionLabel = styled.label`
  display: inline-block;
  width: 40%;
  color: ${({ theme }) => theme.emphasizedTextColor};
  font-size: ${({ theme }) => theme.fontSizes.small}px;
`

export const SectionParagraph = styled.div`
  display: block;
  color: ${({ theme }) => theme.emphasizedTextColor};
  font-size: ${({ theme }) => theme.fontSizes.default}px;
`

export const SectionSubtleText = styled.p`
  color: ${({ theme }) => theme.subtleTextColor};
`

export const PrimaryAnchor = styled.a`
  color: ${({ theme }) => theme.primaryBackgroundColor};
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.darkerPrimaryBackgroundColor};
    text-decoration: underline;
  }
`

export const SectionMargin = styled.section`
  margin: ${({ theme }) => theme.space.xlarge * 2}px;
`

export const SectionControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.space.small}px;
  text-align: right;
  button {
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
    &:first-child {
      margin-left: 0;
    }
  }
`

export const SectionSelect = styled.select`
  ${selectStyle}
  min-width: 200px;
  width: 60%;
  height: 40px;
  padding: 0 ${({ theme }) => theme.space.small}px;
  border-radius: 2px;

  option {
    color: initial;
  }
`

export const SectionPrimaryButton = styled.button`
  ${baseButtonStyle}
  ${primaryButtonStyle}
  vertical-align: middle;
  align-items: center;

  svg.icon {
    position: relative;
    color: ${({ theme }) => theme.whiteTextColor};
    transform: none;
    top: 0;
    left: 0;
  }
`

export const SectionSecondaryButton = styled.button`
  ${baseButtonStyle}
  ${secondaryButtonStyle}
  align-items: center;
`

export const SectionDangerButton = styled.button`
  ${baseButtonStyle}
  ${dangerButtonStyle}
  align-items: center;
`

export const SectionList = styled.ul`
  margin: 0;
  width: 100%;
  padding: 0;
  margin-top: ${({ theme }) => theme.space.default}px;
  list-style: none;
`

export const SectionListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.space.xxsmall}px;
  border-bottom: 1px solid ${({ theme }) => theme.baseBorderColor};
  padding-left: 2%;
  margin-bottom: ${({ theme }) => theme.space.xxsmall}px;

  span {
    height: 20px;
  }

  + li {
    margin-top: ${({ theme }) => theme.space.small}px;
  }
`

export const SectionRow = styled.div`
  display: flex;
  align-items: center;

  label,
  input {
    margin-right: ${({ theme }) => theme.space.small}px;
  }
`

export const SectionInLineIcon = styled.span`
  display: inline-block;
  cursor: pointer;
  ${baseIconStyle}
`

export const SectionIcon = styled.div`
  position: relative;
  width: 50px;
  height: 40px;
  margin-left: 16px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;
  text-align: center;
  ${baseIconStyle}

  .icon {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    width: 1.6em !important;
  }
`

export const SectionInput = styled.input`
  ${inputStyle}
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 200px;
  width: 60%;
  height: 40px;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  border-radius: 2px;
`

export const SectionTextarea = styled.textarea`
  ${inputStyle}
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 200px;
  width: 100%;
  height: 200px;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  border-radius: 2px;
  resize: none;
`

export const SectionProfilePic = styled.div`
  margin-top: ${({ theme }) => theme.space.default}px;
`

export const SectionFooter = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  padding: ${({ theme }) => theme.space.small}px
    ${({ theme }) => theme.space.default}px;
  border-top: 1px solid ${({ theme }) => theme.baseBorderColor};
  text-align: center;
`

export const SectionTable = styled.table`
  ${tableStyle}
  margin-top: ${({ theme }) => theme.space.default}px;
  margin-bottom: ${({ theme }) => theme.space.default}px;
`

export const RightMargin = styled.span`
  margin-right: ${({ theme }) => theme.space.default}px;
`

export const TopMargin = styled.div`
  margin-top: ${({ theme }) => theme.space.large}px;
`

export const DeleteStorageButton = styled.button`
  ${baseButtonStyle}
  ${secondaryButtonStyle}
  padding: 0 ${({ theme }) => theme.space.small}px;
  height: 40px;
  border-radius: 2px;
  cursor: pointer;
  vertical-align: middle;
  align-items: center;
`

export const SectionIntroduction = styled.div`
  .setHeight {
    display: block;
    height: ${({ theme }) => theme.space.medium}px;
  }

  .badge {
    margin: ${({ theme }) => theme.space.medium}px 0
      ${({ theme }) => theme.space.small}px 0;
  }
`

export const SectionFlexRow = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: ${({ theme }) => theme.space.small}px;

  &:not(.alignLeft) {
    justify-content: flex-end;
  }

  .alignLeft {
    justify-content: flex-start;
  }

  strong {
    font-size: ${({ theme }) => theme.fontSizes.large}px;
  }

  label {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.subtleTextColor};
  }

  .value {
    padding: 0 ${({ theme }) => theme.space.medium}px;
    flex: 1 0 auto;
    text-align: right;
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-weight: bold;
  }

  .button-wrapper {
    flex: 0 0 auto;
    button {
      line-height: 30px !important;
    }
  }
`

export const StyledSmallFont = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small}px;
`

export const SectionFlexDualButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &.marginTop {
    margin-top: ${({ theme }) => theme.space.medium}px;
  }

  button {
    margin-left: ${({ theme }) => theme.space.small}px;

    svg {
      position: relative !important;
      transform: none !important;
      top: initial !important;
      left: initial !important;
    }
  }
`

export const SectionDescription = styled.small`
  color: ${({ theme }) => theme.subtleTextColor};
  display: block;
  margin-bottom: ${({ theme }) => theme.space.xsmall}px;
  line-height: 1.6;
`

export const SectionFlexLeft = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: ${({ theme }) => theme.space.medium}px 0;
`

export const SectionSeparator = styled.div`
  background-color: ${({ theme }) => theme.baseBorderColor};
  width: 100%;
  margin: 120px 0 40px 0;
  height: 1px;
`

export const StyledWrap = styled.div`
  display: flex;
  justify-content: space-between;
`

export const StyledMembername = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;

  p {
    margin: 0;
    color: ${({ theme }) => theme.baseTextColor};
    padding-right: ${({ theme }) => theme.space.xsmall}px;
  }

  span {
    color: ${({ theme }) => theme.subtleTextColor};
    margin-left: ${({ theme }) => theme.space.xsmall}px;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    padding: 2px 5px;
  }
`

export const StyledButtonWrap = styled.div`
  ${paddingLeftMedium}
`
