import styled from '../../../lib/styled'
import { inputStyle } from '../../../lib/styled/styleFunctions'

export const StyledTeamEditForm = styled.form`
  margin: 0 auto;
  color: ${({ theme }) => theme.baseTextColor};

  &.fullPage {
    margin: ${({ theme }) => theme.space.medium}px 0;
  }

  .flex {
    display: flex;
    width: 100%;
    align-items: center;
  }

  .row {
    display: block;
    margin: ${({ theme }) => theme.space.medium}px 0
      ${({ theme }) => theme.space.small}px;

    input {
      ${inputStyle}
      min-width: 200px;
      width: 100%;
      height: 40px;
      padding: ${({ theme }) => theme.space.xsmall}px
        ${({ theme }) => theme.space.small}px;
    }

    label {
      display: block;
      margin: ${({ theme }) => theme.space.xsmall}px 0;
      font-size: ${({ theme }) => theme.fontSizes.default}px;
      font-weight: 500;
      color: ${({ theme }) => theme.baseTextColor};
    }

    .input-domain {
      margin: ${({ theme }) => theme.space.small} 0;
    }

    .description {
      font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
      margin: ${({ theme }) => theme.space.xsmall}px 0;
      color: ${({ theme }) => theme.subtleTextColor};

      .underlined {
        font-weight: 500;
        padding-left: ${({ theme }) => theme.space.xxsmall}px;
        text-decoration: underline;
      }
    }
  }

  .submit-team {
    float: right;
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
    justify-content: flex-end;
    align-items: center;
    margin-top: ${({ theme }) => theme.space.xlarge}px;
  }

  .go-back {
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    display: flex;
    align-items: center;
    margin-right: ${({ theme }) => theme.space.xsmall}px;
  }

  .clear {
    clear: both;
  }
`
