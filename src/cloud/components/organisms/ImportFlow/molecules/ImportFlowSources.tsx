import React from 'react'
import {
  mdiLanguageHtml5,
  mdiLanguageMarkdownOutline,
  mdiGoogle,
} from '@mdi/js'
import styled from '../../../../../shared/lib/styled'
import Icon from '../../../../../shared/components/atoms/Icon'
import { overflowEllipsis } from '../../../../../shared/lib/styled/styleFunctions'

interface ImportModalSelectSourceProps {
  pickSource: (val: string) => void
}

const ImportFlowSource = ({ pickSource }: ImportModalSelectSourceProps) => (
  <Container>
    <div className='import__flow__row'>
      <SourceButton
        label={'Markdown or text'}
        logo={<Icon path={mdiLanguageMarkdownOutline} size={26} />}
        onClick={() => pickSource('md')}
      />
      <SourceButton
        label={'Html'}
        logo={<Icon path={mdiLanguageHtml5} size={26} />}
        onClick={() => pickSource('html')}
      />
      <SourceButton
        label={'Evernote'}
        logo={<img src='/app/static/logos/evernote.svg' />}
        onClick={() => pickSource('evernote')}
        externalLink='https://intercom.help/boostnote-for-teams/en/articles/4409881-evernote-to-boost-note'
      />
    </div>
    <div className='import__flow__row'>
      <SourceButton
        label={'Confluence'}
        logo={<img src='/app/static/logos/confluence.svg' />}
        onClick={() => pickSource('confluence')}
        externalLink='https://intercom.help/boostnote-for-teams/en/articles/4409894-confluence-to-boost-note'
      />
      <SourceButton
        label={'Notion'}
        logo={<img src='/app/static/logos/notion.svg' />}
        onClick={() => pickSource('notion')}
        externalLink='https://intercom.help/boostnote-for-teams/en/articles/4409889-notion-to-boost-note'
      />
      <SourceButton
        label={'Google Docs'}
        logo={<Icon path={mdiGoogle} size={26} />}
        onClick={() => pickSource('gdocs')}
        externalLink='https://intercom.help/boostnote-for-teams/en/articles/4409883-google-docs-to-boost-note'
      />
    </div>
    <div className='import__flow__row'>
      <SourceButton
        label={'Quip'}
        logo={<img src='/app/static/logos/quip.svg' />}
        onClick={() => pickSource('quip')}
        externalLink='https://intercom.help/boostnote-for-teams/en/articles/4409878-quip-to-boost-note'
      />
      <SourceButton
        label={'Dropbox'}
        logo={<img src='/app/static/logos/dropboxpaper.svg' />}
        onClick={() => pickSource('dropbox')}
        externalLink='https://intercom.help/boostnote-for-teams/en/articles/4409893-dropbox-paper-to-boost-note'
      />
    </div>
  </Container>
)

const SourceButton = ({
  label,
  logo,
  externalLink,
  onClick,
}: {
  label: string
  onClick: () => void
  logo: React.ReactNode
  externalLink?: string
}) => (
  <div className='import__source'>
    <button className='import__source__button' onClick={onClick}>
      <div className='import__source__icon'>{logo}</div>
      <span className='import__source__label'>{label}</span>
    </button>
    {externalLink && (
      <a
        rel='noopener noreferrer'
        target='_blank'
        className='import__source__link'
        href={externalLink}
      >
        ?
      </a>
    )}
  </div>
)

const Container = styled.div`
  .import__flow__row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .import__source__button {
    background: none;
    display: inline-flex;
    flex: 1 1 auto;
    color: inherit;
    align-items: center;
    text-align: left;

    &:hover {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }

  .import__flow__row + .import__flow__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .import__source {
    display: flex;
    width: 33%;
    flex: 1 1 auto;
    max-width: 33%;
    align-items: center;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    border-radius: ${({ theme }) => theme.borders.radius}px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .import__source__label {
    flex: 1 1 auto;
    ${overflowEllipsis}
  }

  .import__source + .import__source {
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .import__source__icon {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    img,
    svg {
      width: 26;
      height: 26px;
    }
  }

  .import__source__link {
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    background: ${({ theme }) => theme.colors.variants.secondary.base};
    color: ${({ theme }) => theme.colors.variants.secondary.text};
    line-height: 20px;

    &:hover {
      filter: brightness(1.3);
    }
  }
`

export default ImportFlowSource
