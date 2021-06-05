import styled from '../../shared/lib/styled'
import { selectStyle, inputStyle } from '../../shared/lib/styled/styleFunctions'

export const Section = styled.section`
  margin-bottom: 2em;
`

export const SectionHeader = styled.h3`
  font-size: 18px;
  font-weight: 500;
`

export const SectionSubtleText = styled.p`
  color: ${({ theme }) => theme.colors.text.disabled};
`

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
  ${selectStyle};
  padding: 0 16px;
  width: 200px;
  height: 40px;
  border-radius: 2px;
  font-size: 14px;
`

export const SectionInput = styled.input`
  ${inputStyle};
  padding: 0 16px;
  width: 200px;
  height: 35px;
  border-radius: 2px;
  font-size: 14px;
`

export const SectionListSelect = styled.div`
  ${selectStyle};
  padding: 0 16px;
  width: 200px;
  height: 40px;
  border-radius: 2px;
  font-size: 14px;
`

export const SearchMatchHighlight = styled.span`
  background-color: ${({ theme }) =>
    theme.codeEditorSelectedTextBackgroundColor};
  color: #212121 !important;
  padding: 2px;
`
