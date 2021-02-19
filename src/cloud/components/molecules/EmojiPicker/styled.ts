import styled from '../../../lib/styled'

export const StyledEmojiPicker = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: 8002;
  padding: 0;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  outline: none;
  width: auto;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.baseBackgroundColor};

  .emoji-mart {
    background-color: ${({ theme }) => theme.baseBackgroundColor};
    border-color: ${({ theme }) => theme.baseBorderColor};
    color: ${({ theme }) => theme.baseTextColor};

    .emoji-mart-category-label span {
      background-color: ${({ theme }) => theme.baseBackgroundColor};
    }

    .emoji-mart-bar {
      border-color: ${({ theme }) => theme.baseBorderColor};
    }

    input {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
      color: ${({ theme }) => theme.emphasizedTextColor};
      border-color: ${({ theme }) => theme.baseBorderColor};
      margin-bottom: 5px;

      &:focus {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryShadowColor};
      }
    }
  }
`
