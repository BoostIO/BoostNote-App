import React from 'react'

interface EventSelectProps {
  name: string
  typeDef: JsonTypeDef
}

const EventInfo = ({ typeDef }: EventSelectProps) => {
  return (
    <div>
      <pre>{JSON.stringify(typeDef, null, 2).replaceAll('"', '')}</pre>
    </div>
  )
}

export default EventInfo
