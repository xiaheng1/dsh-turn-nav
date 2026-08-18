/** Node half: registers the plugin's durable settings namespace. */
import type { Context } from '@deepseek-ai/cordis'
import { apply as applySettings } from './settings.ts'

export {
  DEFAULT_TURN_NAV_CONFIG,
  TURN_NAV_NAMESPACE,
  type TurnNavConfig,
} from './config.ts'

export function apply(ctx: Context): void {
  applySettings(ctx)
}
