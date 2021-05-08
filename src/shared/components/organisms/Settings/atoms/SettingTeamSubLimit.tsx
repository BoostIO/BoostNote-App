import styled from '../../../../lib/styled'

const SettingTeamSubLimit = styled.nav`
  width: 100%;
  margin-top: ${({ theme }) => theme.sizes.spaces.l}px;

  h6 {
    margin: 0;
    color: ${({ theme }) => theme.colors.variants.primary.base};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }

  p {
    margin: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  }

  .upgrade-link {
    display: block;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    cursor: pointer;
    text-decoration: none;

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
  }

  .note-limit {
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  }

  .progress-sm {
    display: block;
    position: relative;
    width: 100%;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.background.quaternary};
    border-radius: 0.25rem;
    font-size: 0.75rem;
    overflow: hidden;
    text-align: center;
  }

  .progress-bar {
    flex-direction: column;
    justify-content: center;
    height: 3px;
    max-width: 100%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    text-align: center;
    white-space: nowrap;
    transition: width 0.6s ease;

    &.over-limit {
      background-color: ${({ theme }) => theme.colors.variants.danger.base};
    }
  }

  .text-danger {
    color: ${({ theme }) => theme.colors.variants.danger.base};
  }
`

export default SettingTeamSubLimit
