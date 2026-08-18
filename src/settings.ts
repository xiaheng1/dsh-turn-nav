/**
 * Node-half settings registration for dsh-turn-nav.
 *
 * Registers the plugin's configuration namespace with DSH's user-settings
 * document (`settings.yaml` / `settings.json`). Defaults live in the schema,
 * so an absent section behaves exactly like the pre-configuration 4.3 build.
 */

import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  DEFAULT_TURN_NAV_CONFIG,
  TURN_NAV_NAMESPACE,
  type TurnNavConfig,
} from './config.ts'

/** Schemastery schema used by DSH settings to validate and render the section. */
export const TurnNavConfigSchema: Schema<TurnNavConfig> = Schema.object({
  barWidth: Schema.number().min(4).max(40).default(DEFAULT_TURN_NAV_CONFIG.barWidth),
  focusedBarWidth: Schema.number().min(4).max(80).default(DEFAULT_TURN_NAV_CONFIG.focusedBarWidth),
  adjacentBarWidth: Schema.number().min(4).max(80).default(DEFAULT_TURN_NAV_CONFIG.adjacentBarWidth),
  neighborBarWidth: Schema.number().min(4).max(80).default(DEFAULT_TURN_NAV_CONFIG.neighborBarWidth),
  waveTransitionMs: Schema.number().min(0).max(2000).default(DEFAULT_TURN_NAV_CONFIG.waveTransitionMs),
  previewEnabled: Schema.boolean().default(DEFAULT_TURN_NAV_CONFIG.previewEnabled),
  previewWidth: Schema.number().min(120).max(720).default(DEFAULT_TURN_NAV_CONFIG.previewWidth),
  previewMaxHeight: Schema.number().min(48).max(960).default(DEFAULT_TURN_NAV_CONFIG.previewMaxHeight),
  minTurns: Schema.number().min(1).max(100).default(DEFAULT_TURN_NAV_CONFIG.minTurns),
  hideOnNarrow: Schema.boolean().default(DEFAULT_TURN_NAV_CONFIG.hideOnNarrow),
  railOffsetRight: Schema.number().min(0).max(120).default(DEFAULT_TURN_NAV_CONFIG.railOffsetRight),
  previewGap: Schema.number().min(0).max(120).default(DEFAULT_TURN_NAV_CONFIG.previewGap),
  itemWidth: Schema.number().min(12).max(120).default(DEFAULT_TURN_NAV_CONFIG.itemWidth),
  itemHeight: Schema.number().min(8).max(64).default(DEFAULT_TURN_NAV_CONFIG.itemHeight),
  scrollOffset: Schema.number().min(0).max(240).default(DEFAULT_TURN_NAV_CONFIG.scrollOffset),
})

/**
 * Register the namespace when a settings provider exists.
 * @param ctx - host context.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(
      settingsNamespace(TURN_NAV_NAMESPACE),
      TurnNavConfigSchema,
    )
  })
}
