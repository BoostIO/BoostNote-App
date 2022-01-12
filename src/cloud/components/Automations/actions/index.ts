import { SerializedPipe } from '../../../interfaces/db/automations'
import { JsonTypeDef } from '../../../lib/automations/events'

export interface ActionConfiguratorProps {
  onChange: (conf: SerializedPipe['configuration']) => void
  configuration: SerializedPipe['configuration']
  eventType: JsonTypeDef
}
