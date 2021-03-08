import styled from '../../../../../../lib/styled'

export const StyledRevisionTitle = styled.strong`
  font-size: ${({ theme }) => theme.fontSizes.xxxlarge}px;
  margin: ${({ theme }) => theme.space.small}px
    ${({ theme }) => theme.space.default}px;
  flex: 0 0 auto;
  height: 36px;
  overflow: hidden;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const StyledContent = styled.div`
  color: ${({ theme }) => theme.emphasizedTextColor};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const MarkdownWrapper = styled.div`
  flex: 1 1 auto;
  height: 100%;
  padding: 0 ${({ theme }) => theme.space.default}px;
  overflow-y: hidden;

  .CodeMirrorWrapper,
  .CodeMirrorWrapper .CodeMirror-wrap {
    height: 100%;
  }
`

export const StyledNoSubContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 80%;
  margin: auto;
  height: 100%;
  justify-content: center;
  align-items: center;

  color: ${({ theme }) => theme.baseTextColor};

  p {
    text-align: center;
  }

  svg {
    color: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

export const StyledRevisionItem = styled.button`
  display: block;
  width: 100%;
  height: auto;
  text-align: left;
  background: none;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.baseBorderColor};
  padding: ${({ theme }) => theme.space.small}px
    ${({ theme }) => theme.space.small}px;

  &:not(:disabled):hover,
  &:not(:disabled):focus,
  &:not(:disabled).active {
    background: ${({ theme }) => theme.subtleBackgroundColor};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`

export const StyledVerticalScroller = styled.div`
  overflow: hidden auto;
  width: 100%;
  flex: 1 1 auto;
  min-height: 20px;
  ::-webkit-scrollbar {
    display: none;
  }
`

export const StyledWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
`

export const StyledRevisionCreators = styled.strong`
  color: ${({ theme }) => theme.baseTextColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 250px;
`

export const StyledRevisionDateTime = styled.span`
  color: ${({ theme }) => theme.secondaryTextColor};
`

export const StyledHeader = styled.div`
  width: 100%;
  text-align: center;
  padding: ${({ theme }) => theme.space.small}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.baseBorderColor};
  flex: 0 0 auto;
  position: relative;

  &.align-left {
    text-align: left;
    padding: ${({ theme }) => theme.space.small}px
      ${({ theme }) => theme.space.small}px;
    width: 100%;
    height: auto;
  }
`

export const StyledHeaderTitle = styled.h3`
  font-weight: bold;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  margin: 0;
`

export const StyledHeaderDescription = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  color: ${({ theme }) => theme.secondaryTextColor};
`

export const StyledRevisionsModal = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  .left {
    width: 300px;
    height: 100%;
    border: 0;
    border-right: 1px solid ${({ theme }) => theme.baseBorderColor};
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
  }

  .right {
    position: relative;
    height: 100%;
    flex: 1 1 auto;
    overflow: hidden;
  }
`
