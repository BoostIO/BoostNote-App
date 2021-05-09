import styled from '../../../../lib/styled'

const SettingDivider = styled.div`
  margin-top: ${({ theme }) => theme.sizes.spaces.l}px;
  margin-bottom: ${({ theme }) => theme.sizes.spaces.l}px;
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.main};
`

export default SettingDivider
