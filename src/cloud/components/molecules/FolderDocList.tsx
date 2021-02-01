import styled from '../../lib/styled'

const FolderDocList = styled.div`
  margin: ${({ theme }) => theme.space.xsmall}px 0;
  width: 100%;

  svg {
    font-size: ${({ theme }) => theme.fontSizes.xlarge}px;
    vertical-align: middle !important;
  }

  .controls svg {
    transform: translateY(0) !important;
  }

  .itemLink {
    padding: ${({ theme }) => theme.space.xsmall}px;
  }

  .label {
    padding-left: ${({ theme }) => theme.space.xsmall}px;
    margin-bottom: 0;
  }
`

export default FolderDocList
