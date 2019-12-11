import styled from '../../lib/styled'
import {
  selectStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  inputStyle,
  tableStyle
} from '../../lib/styled/styleFunctions'

export const Section = styled.section`
  margin-bottom: 2em;
`

export const SectionHeader = styled.h3``

export const SectionControl = styled.div`
  margin-bottom: 1em;
  display: flex;
  align-items: center;
  button {
    margin-left: 4px;
    &:first-child {
      margin-left: 0;
    }
  }
`

export const SectionSelect = styled.select`
  ${selectStyle}
  padding: 0 16px;
  height: 40px;
  border-radius: 2px;

  option {
    color: initial;
  }
`

export const SectionPrimaryButton = styled.button`
  ${primaryButtonStyle}
  padding: 0 16px;
  height: 40px;
  border-radius: 2px;
  cursor: pointer;
  vertical-align: middle;
  align-items: center;
`

export const SectionSecondaryButton = styled.button`
  ${secondaryButtonStyle}
  padding: 0 16px;
  height: 40px;
  border-radius: 2px;
  cursor: pointer;
  align-items: center;
`

export const SectionInput = styled.input`
  ${inputStyle}
  padding: 0 16px;
  height: 40px;
  border-radius: 2px;
`

export const SectionTable = styled.table`
  ${tableStyle}
`