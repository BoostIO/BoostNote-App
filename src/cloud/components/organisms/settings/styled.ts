import styled from '../../../lib/styled'
import { baseIconStyle } from '../../../lib/styled/styleFunctions'

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
