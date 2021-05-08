import styled from '../../../lib/styled'
import {
  selectStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  inputStyle,
  baseIconStyle,
  baseButtonStyle,
} from '../../../lib/styled/styleFunctions'

export const Section = styled.section`
  padding: ${({ theme }) => theme.space.xsmall}px 0;
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
