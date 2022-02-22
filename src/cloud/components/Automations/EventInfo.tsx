import React from 'react'
import { BoostType } from '../../lib/automations'

interface EventSelectProps {
  name: string
  typeDef: BoostType
}

const EventInfo = ({ typeDef }: EventSelectProps) => {
  return (
    <div>
      <pre>{JSON.stringify(typeDef, null, 2).replaceAll('"', '')}</pre>
    </div>
  )
}

export default EventInfo
