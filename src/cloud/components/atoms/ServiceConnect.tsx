import React, { useCallback, useRef, useEffect } from 'react'
import CustomButton, { PrimaryButtonProps } from './buttons/CustomButton'
import { useToast } from '../../lib/stores/toast'
import { SerializedServiceConnection } from '../../interfaces/db/connections'
import { createServiceConnectionFromOAuth } from '../../api/connections'

interface ServiceConnectProps extends PrimaryButtonProps {
  service: string
  onConnect: (connection: SerializedServiceConnection) => void
  children?: React.ReactNode
}

const windowFeatures =
  'toolbar=no, menubar=no, width=600, height=700, top=100, left=100, location=no'

const ServiceConnect = ({
  service,
  onConnect,
  children = 'Connect',
  ...buttonProps
}: ServiceConnectProps) => {
  const { pushApiErrorMessage: pushAxiosErrorMessage, pushMessage } = useToast()
  const childRef = useRef<Window | null>()

  useEffect(() => {
    const callback = async (message: MessageEvent) => {
      if (message.source !== childRef.current) {
        return
      }
      const { service: eventService, state, code } = message.data
      if (eventService == service || state != null || code != null) {
        try {
          const { connection } = await createServiceConnectionFromOAuth(
            `sc-${service}`,
            message.data
          )
          onConnect(connection)
        } catch (err) {
          pushAxiosErrorMessage(err)
        }
      } else {
        pushMessage({
          title: 'Error',
          description: 'An error occured while authenticating',
        })
      }
      if (childRef.current != null) {
        childRef.current.close()
      }
      childRef.current = null
    }
    window.addEventListener('message', callback, false)
    return () => {
      window.removeEventListener('message', callback)
    }
  }, [service, pushMessage, pushAxiosErrorMessage, onConnect])

  const onClick = useCallback(() => {
    if (childRef.current != null && childRef.current.closed) {
      childRef.current = null
    }
    if (childRef.current != null) {
      childRef.current.focus()
      return
    }
    childRef.current = window.open(
      `/api/oauth/${service}/authorize`,
      `service-popup-${service}`,
      windowFeatures
    )
  }, [service])

  return (
    <CustomButton {...buttonProps} onClick={onClick}>
      {children}
    </CustomButton>
  )
}

export default ServiceConnect
