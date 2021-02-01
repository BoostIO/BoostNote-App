import styled from '../../../../../lib/styled'
import { borderedInputStyle } from '../../../../../lib/styled/styleFunctions'

export const StyledModalForm = styled.form`
  .rc-select {
    .select__control {
      ${borderedInputStyle}
      width: 100%;
      height: 40px;
      cursor: text;
      option,
      .select__single-value,
      .select__value-container {
        color: ${({ theme }) => theme.emphasizedTextColor};
      }

      &.select__control--is-focused {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryShadowColor};
      }
    }

    .select__menu {
      background: ${({ theme }) => theme.baseBackgroundColor};
      box-shadow: ${({ theme }) => theme.baseShadowColor};
    }
  }
`

export const StyledModalFormIconPicker = styled.div`
  ${borderedInputStyle}
  width: 100%;
  height: 40px;
  padding: 6px ${({ theme }) => theme.space.small}px;
  position: relative;

  svg {
    color: ${({ theme }) => theme.emphasizedTextColor};
    margin: 0;
  }

  &:hover {
    background: ${({ theme }) => theme.subtleBackgroundColor};
  }
`

export const StyledModalFormInput = styled.input`
  ${borderedInputStyle}
  width: 100%;
  height: 40px;
`

export const StyledTemplateList = styled.div`
  resize: none;
  width: 100%;
  height: 170px;
  padding: ${({ theme }) => theme.space.xsmall}px 0;
`

export const StyledModalFormTextArea = styled.textarea`
  ${borderedInputStyle}
  resize: none;
  width: 100%;
  height: 160px;
  padding: ${({ theme }) => theme.space.small}px;
`

export const StyledModalFormIconDiv = styled.div`
  width: 70px;
  flex: 0 0 auto;
  margin-right: ${({ theme }) => theme.space.small}px;
  text-align: center;
  span {
    margin: 0;
  }
`

export const StyledModalFormFlexGrowDiv = styled.div`
  width: 100%;
  flex: 1 1 auto;
`
