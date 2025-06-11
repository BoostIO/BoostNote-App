import React, { useCallback, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { usePage } from '../../../lib/stores/pageStore'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import { exportWorkspace } from '../../../api/teams/export'
import Flexbox from '../../../../design/components/atoms/Flexbox'

const ExportModal = () => {
  const { team } = usePage()
  const [sending, setSending] = useState(false)

  const handleExportClick = useCallback(async () => {
    if (team == null || sending) {
      return
    }

    setSending(true)
    try {
      const blob = await exportWorkspace(team.id)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `space-${team.name}-export.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export space', err)
    } finally {
      setSending(false)
    }
  }, [team, sending])

  if (team == null) {
    return null
  }

  return (
    <Container className='export__modal'>
      <header className='export__modal__header'>
        <div className='export__modal__title'>Export your space data</div>
      </header>
      <p className='export__modal__description'>
        The service for boostnote is planned to be retired at the end of
        September. We recommend exporting your space&apos;s data so that you do
        not lose any of your information.
      </p>
      <p>Here is an overview of what can be exported:</p>
      <ul>
        <li>Public & your accessible private Folders & documents hierarchy</li>
        <li>Your Documents&apos; content</li>
        <li>Your Documents&apos;attachments</li>
      </ul>

      <Flexbox justifyContent='center'>
        <LoadingButton
          disabled={sending || team == null}
          spinning={sending}
          onClick={handleExportClick}
        >
          Download ZIP
        </LoadingButton>
      </Flexbox>
    </Container>
  )
}

const Container = styled.div`
  text-align: center;
  .export__modal__subtitle {
    span {
      font-size: ${({ theme }) => theme.sizes.fonts.md}px;
      display: inline-block;
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .export__modal__header {
    text-align: center;
  }

  .export__modal__title {
    margin: 0;
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
  }

  .export__modal__header > * + .export__modal__header > * {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .export__modal__description {
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.md};
  }

  li {
    list-style: none;
  }
`

export default ExportModal
