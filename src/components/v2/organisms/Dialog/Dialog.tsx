import React from 'react'
import DialogIcon from './atoms/DialogIcon'
import MessageBoxDialogBody from './molecules/MessageBoxDialogBody'
import {
  DialogData,
  DialogTypes,
  useDialog,
} from '../../../../shared/lib/stores/dialog'
import styled from '../../../../shared/lib/styled'

const Dialog = () => {
  const { data, closeDialog } = useDialog()

  if (data == null) return null

  function renderBody(dialogData: DialogData) {
    switch (dialogData.type) {
      case DialogTypes.MessageBox:
        return (
          <MessageBoxDialogBody
            key={dialogData.id}
            buttons={dialogData.buttons}
            closeDialog={closeDialog}
          />
        )
      default:
        return null
    }
  }

  return (
    <Container>
      <div className='dialog'>
        <DialogIcon className='dialog__icon' icon={data.iconType} />
        <div className='dialog__content'>
          <h1 className='dialog__title'>{data.title}</h1>
          <p className='dialog__message'>{data.message}</p>
          {renderBody(data)}
        </div>
      </div>
      <div className='dialog__background' onClick={closeDialog} />
    </Container>
  )
}

const dialogZIndex = 8003

const Container = styled.div`
  .dialog__background {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: ${dialogZIndex};
    display: flex;
    background-color: rgba(0, 0, 0, 0.4);
    justify-content: center;
    align-items: flex-start;
  }

  .dialog {
    width: 100%;
    max-width: 450px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border-color: ${({ theme }) => theme.colors.border.main};
    border-style: solid;
    border-width: 0 1px 1px 1px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    box-sizing: border-box;
    border-radius: 0 0 5px 5px;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.35);
    outline: none;
    display: flex;
    position: absolute;
    right: 0;
    left: 0;
    top: ${({ theme }) => theme.sizes.spaces.sm}px;
    z-index: ${dialogZIndex + 1};
    margin: auto;
  }

  .dialog__icon {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    line-height: 100%;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .dialog__title {
    margin: 0 0 ${({ theme }) => theme.sizes.spaces.sm}px;
    padding: 0;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    flex: 0 0 auto;
  }

  .dialog__message {
    margin: 0;
    padding: 0;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    flex: 0 0 auto;
  }

  .dialog__content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }
`

export default Dialog
