import React, { useCallback, useRef, useEffect } from 'react'
import CustomButton, { PrimaryButtonProps } from './buttons/CustomButton'
import {
  SerializedServiceConnection,
  SerializedTeamIntegration,
} from '../../interfaces/db/connections'
import { createServiceConnectionFromOAuth } from '../../api/connections'
import { useToast } from '../../../shared/lib/stores/toast'
import { SerializedTeam } from '../../interfaces/db/team'

export type Integration =
  | { type: 'team'; integration: SerializedTeamIntegration }
  | { type: 'user'; integration: SerializedServiceConnection }

interface ServiceConnectProps extends PrimaryButtonProps {
  service: string
  onConnect: (Integration: Integration) => void
  team?: SerializedTeam
  children?: React.ReactNode
}

const windowFeatures = 'location=yes, width=600, height=700, top=100, left=100'

const ServiceConnect = ({
  service,
  onConnect,
  team,
  children = 'Connect',
  ...buttonProps
}: ServiceConnectProps) => {
  const { pushApiErrorMessage, pushMessage } = useToast()
  const childRef = useRef<Window | null>()

  useEffect(() => {
    const callback = async (message: MessageEvent) => {
      if (message.source !== childRef.current) {
        return
      }
      const { service: eventService, state, code } = message.data
      if (eventService == service || state != null || code != null) {
        try {
          const integration = await createServiceConnectionFromOAuth(
            service,
            message.data
          )
          onConnect(integration)
        } catch (err) {
          pushApiErrorMessage(err)
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
  }, [service, pushMessage, pushApiErrorMessage, onConnect])

  const onClick = useCallback(() => {
    if (childRef.current != null && childRef.current.closed) {
      childRef.current = null
    }
    if (childRef.current != null) {
      childRef.current.focus()
      return
    }
    let url = `/api/oauth/${service}/authorize`
    if (team != null) {
      url = `${url}?team=${team.id}`
    }
    childRef.current = window.open(
      url,
      `service-popup-${service}`,
      windowFeatures
    )
  }, [service, team])

  return (
    <CustomButton {...buttonProps} onClick={onClick}>
      {children}
    </CustomButton>
  )
}

export default ServiceConnect
