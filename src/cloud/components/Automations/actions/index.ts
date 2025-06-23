import { SerializedPipe } from '../../../interfaces/db/automations'
import { BoostType } from '../../../lib/automations'

export interface ActionConfiguratorProps {
  onChange: (conf: SerializedPipe['configuration']['input']) => void
  configuration: SerializedPipe['configuration']['input']
  eventType: BoostType
}
