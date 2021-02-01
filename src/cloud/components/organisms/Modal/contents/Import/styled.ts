import styled from '../../../../../lib/styled'

export const StyledImportModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`
export const StyledImportModalHeader = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  flex: 0 0 auto;
  margin-bottom: ${({ theme }) => theme.space.default}px;
`

export const StyledImportModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1 1 auto;

  a {
    transition: 200ms color;
    color: ${({ theme }) => theme.lightBlueBackgroundColor};

    &:hover,
    &:focus,
    &:active,
    &.active {
      color: ${({ theme }) => theme.primaryBackgroundColor};
    }
  }
`

export const StyledImportModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex: 0 0 auto;
  margin-top: ${({ theme }) => theme.space.small}px;
`

export const StyledImportStep = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  color: ${({ theme }) => theme.baseTextColor};

  &.active {
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-weight: bold;
  }
`
export const StyledImportStepSeparator = styled.div`
  color: ${({ theme }) => theme.subtleTextColor};
  margin: 0 ${({ theme }) => theme.space.xsmall}px;
`

export const StyledSourceRow = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.space.small}px;
`

export const StyledSourceButton = styled.button`
  flex: 1 1 auto;
  width: 50%;
  display: flex;
  padding: ${({ theme }) => theme.space.xxsmall}px
    ${({ theme }) => theme.space.xsmall}px;
  align-items: center;
  background: none;
  outline: 0;
  max-width: 50%;
  border: 0;
  color: ${({ theme }) => theme.baseTextColor};

  span {
    color: ${({ theme }) => theme.subtleTextColor};
  }

  &:hover {
    background: ${({ theme }) => theme.subtleBackgroundColor};
  }
`

export const StyledSourceButtonLogoWrap = styled.div`
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  margin-right: ${({ theme }) => theme.space.small}px;

  svg {
    color: ${({ theme }) => theme.baseTextColor};
  }
`

export const StyledSourceButtonTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 1 auto;
  text-align: left;
`

export const StyledProgressBarWrapper = styled.div`
  display: block;
  border-radius: 3px;
  height: 28px;
  width: 100%;
  position: relative;
  background: ${({ theme }) => theme.subtleBackgroundColor};
`

export const StyledProgressBar = styled.div`
  display: block;
  height: 100%;
  border-radius: 3px;
  background: ${({ theme }) => theme.primaryBackgroundColor};
`
