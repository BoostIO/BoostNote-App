import styled from '../../../design/lib/styled'

export const SectionList = styled.ul`
  margin: 0;
  width: 100%;
  padding: 0;
  margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  list-style: none;
`

export const SectionListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  padding-left: 2%;
  margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;

  span {
    height: 20px;
  }

  + li {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export const SectionRow = styled.div`
  display: flex;
  align-items: center;

  label,
  input {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export const SectionIntroduction = styled.div`
  .setHeight {
    display: block;
    height: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .badge {
    margin: ${({ theme }) => theme.sizes.spaces.md}px 0
      ${({ theme }) => theme.sizes.spaces.sm}px 0;
  }

  & .subscription__management__warning {
    background-color: transparent;
    border-color: white;
  }
`

export const SectionFlexRow = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;

  &:not(.alignLeft) {
    justify-content: flex-end;
  }

  .alignLeft {
    justify-content: flex-start;
  }

  strong {
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
  }

  label {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .value {
    padding: 0 ${({ theme }) => theme.sizes.spaces.md}px;
    flex: 1 0 auto;
    text-align: right;
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: bold;
  }

  .button-wrapper {
    flex: 0 0 auto;
    button {
      line-height: 30px !important;
    }
  }
`
