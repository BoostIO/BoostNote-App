import styled from '../../../lib/styled'

export const StyledAppFeedbackForm = styled.form`
  margin: 0 auto;
  color: ${({ theme }) => theme.baseTextColor};

  .flex {
    display: flex;
    width: 100%;
    align-items: center;
  }

  .row {
    display: block;
    margin: ${({ theme }) => theme.space.medium}px 0
      ${({ theme }) => theme.space.small}px;
  }

  .submit-feedback {
    width: 100px;
    border-radius: 2px;

    svg {
      color: ${({ theme }) => theme.emphasizedTextColor} !important;
    }
  }

  svg.icon {
    top: 0;
    left: 0;
    position: relative !important;
  }

  .submit-row {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    margin-top: ${({ theme }) => theme.space.xlarge}px;
  }

  .clear {
    clear: both;
  }
`
