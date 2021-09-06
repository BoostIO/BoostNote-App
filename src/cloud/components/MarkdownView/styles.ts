import { BaseTheme } from '../../../design/lib/styled/types'

export const defaultPreviewStyle = ({ theme }: { theme: BaseTheme }) => `

.CodeMirror {
  height: inherit;
}

.doc-embed {
  padding: 0;
  border: 1px solid ${theme.colors.border.second};
  border-radius: 3px;
  margin-bottom: ${theme.sizes.spaces.xsm}px;

  color: ${theme.colors.text.primary};

  .doc-embed-wrapper {
    display: flex;
    align-items: stretch;
    flex-wrap: nowrap;
  }

  .collapse-trigger {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    padding-top: ${theme.sizes.spaces.xsm}px;
    padding-left: ${theme.sizes.spaces.xsm}px;
    cursor: pointer;
    overflow: hidden;

    .threadline {
      flex: 1 1 auto;
      width: 1px;
      background: ${theme.colors.background.secondary};
      transition: 0.2s
      display: block;
      margin: auto;
    }

    &:hover .threadline {
      width: 1px;
      background: ${theme.colors.icon.hover}
    }
  }

  svg {
    width: 40px;
    height: 40px;
    cursor: pointer;
    fill: currentColor;
  }

  &.collapsed {
    .collapse-trigger  {
      .threadline {
        display: none;
      }
      svg {
        transform: rotate(-90deg);
      }
    }
    .doc-embed-content {
      display: none;
    }
  }

  .embed-body {
    min-width: 0;
  }

  .doc-embed-header {
    display: flex;
    align-items: center;

    & > div {
      flex: 1;
      min-width: 0;
      padding: ${theme.sizes.spaces.xsm}px ${theme.sizes.spaces.sm}px ${theme.sizes.spaces.xsm}px ${theme.sizes.spaces.xsm}px;
    }

    h1, a {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    h1 {
      font-size: 24px;
      margin: 0;
    }

    p {
      margin: 0;
    }

    a {
      display: block;
    }

    a > svg {
      margin-right: 5px;
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
  }

  .doc-embed-content {
    padding: 0 ${theme.sizes.spaces.sm}px;
  }
}
`
