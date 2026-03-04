import React, { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'
import styled from '../../shared/styled'

interface UpdateStatus {
  isDownloading: boolean
  downloadProgress: number
  hasUpdateReady: boolean
  updateInfo?: {
    version: string
  }
}

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 300px;
  z-index: 9999;
`

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`

const ProgressText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`

const Button = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;

  ${props => props.primary
    ? `
      background: #667eea;
      color: white;
      &:hover {
        background: #5a6fd6;
      }
    `
    : `
      background: #f0f0f0;
      color: #333;
      &:hover {
        background: #e0e0e0;
      }
    `
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  
  &:hover {
    color: #333;
  }
`

const UpdateNotification: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Listen for update events from main process
    ipcRenderer.on('update-checking', () => {
      setMessage('Checking for updates...')
      setVisible(true)
    })

    ipcRenderer.on('update-available', (event, info) => {
      setMessage(`Update available: ${info.version}`)
      setVisible(true)
    })

    ipcRenderer.on('update-not-available', () => {
      setMessage('No updates available')
      setTimeout(() => setVisible(false), 3000)
    })

    ipcRenderer.on('update-download-started', () => {
      setStatus(prev => ({ ...prev, isDownloading: true, downloadProgress: 0 }))
      setMessage('Downloading update...')
      setVisible(true)
    })

    ipcRenderer.on('update-download-progress', (event, progressObj) => {
      setStatus({
        isDownloading: true,
        downloadProgress: progressObj.percent,
        hasUpdateReady: false,
      })
      setMessage(`Downloading: ${progressObj.percent.toFixed(1)}%`)
    })

    ipcRenderer.on('update-downloaded', (event, info) => {
      setStatus({
        isDownloading: false,
        downloadProgress: 100,
        hasUpdateReady: true,
        updateInfo: info,
      })
      setMessage(`Update ${info.version} ready to install`)
      setVisible(true)
    })

    ipcRenderer.on('update-error', (event, errorMessage) => {
      setMessage(`Update error: ${errorMessage}`)
      setTimeout(() => setVisible(false), 5000)
    })

    // Cleanup
    return () => {
      ipcRenderer.removeAllListeners('update-checking')
      ipcRenderer.removeAllListeners('update-available')
      ipcRenderer.removeAllListeners('update-not-available')
      ipcRenderer.removeAllListeners('update-download-started')
      ipcRenderer.removeAllListeners('update-download-progress')
      ipcRenderer.removeAllListeners('update-downloaded')
      ipcRenderer.removeAllListeners('update-error')
    }
  }, [])

  const handleRestart = () => {
    ipcRenderer.invoke('restart-and-install')
  }

  const handleLater = () => {
    setVisible(false)
  }

  const handleCheckUpdate = () => {
    ipcRenderer.invoke('check-for-updates')
  }

  if (!visible) return null

  return (
    <Container>
      <CloseButton onClick={() => setVisible(false)}>×</CloseButton>
      <Title>Update Status</Title>
      
      <div>{message}</div>
      
      {status?.isDownloading && (
        <>
          <ProgressBar>
            <ProgressFill progress={status.downloadProgress} />
          </ProgressBar>
          <ProgressText>{status.downloadProgress.toFixed(1)}%</ProgressText>
        </>
      )}
      
      <ButtonGroup>
        {status?.hasUpdateReady ? (
          <>
            <Button primary onClick={handleRestart}>Restart & Install</Button>
            <Button onClick={handleLater}>Later</Button>
          </>
        ) : status?.isDownloading ? (
          <Button onClick={handleLater}>Hide</Button>
        ) : (
          <Button onClick={handleCheckUpdate}>Check Again</Button>
        )}
      </ButtonGroup>
    </Container>
  )
}

export default UpdateNotification
