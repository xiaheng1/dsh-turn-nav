/// <reference types="node" />
/**
 * Node-half settings registration for dsh-turn-nav.
 *
 * Registers the plugin's configuration namespace with DSH's user-settings
 * document (`settings.yaml` / `settings.json`). The repository-root
 * `dsh-turn-nav.config.json` is loaded as the composition `base` layer, so it
 * is the obvious place to change plugin defaults; DSH user settings still win
 * over it when both are present.
 */

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  DEFAULT_TURN_NAV_CONFIG,
  TURN_NAV_NAMESPACE,
  resolveTurnNavConfig,
  type TurnNavConfig,
} from './config.ts'

/** Schemastery schema used by DSH settings to validate and render the section. */
export const TurnNavConfigSchema: Schema<TurnNavConfig> = Schema.object({
  variant: Schema.union(['mixed', 'deepseek', 'codex']).default(DEFAULT_TURN_NAV_CONFIG.variant),
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
  dotSize: Schema.number().min(4).max(32).default(DEFAULT_TURN_NAV_CONFIG.dotSize),
  scrollOffset: Schema.number().min(0).max(240).default(DEFAULT_TURN_NAV_CONFIG.scrollOffset),
})

/** Load the repository-root config file as the settings composition base. */
function loadConfigFile(): Partial<TurnNavConfig> | undefined {
  const configUrl = new URL('../dsh-turn-nav.config.json', import.meta.url)
  const configPath = fileURLToPath(configUrl)
  if (!existsSync(configPath)) return undefined
  try {
    const raw: unknown = JSON.parse(readFileSync(configPath, 'utf8'))
    return resolveTurnNavConfig(raw)
  } catch (error) {
    console.warn(`[dsh-turn-nav] failed to read ${configPath}; using built-in defaults.`, error)
    return undefined
  }
}

/**
 * Register the namespace when a settings provider exists.
 * @param ctx - host context.
 */
export function apply(ctx: Context): void {
  const base = loadConfigFile()
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(
      settingsNamespace(TURN_NAV_NAMESPACE),
      TurnNavConfigSchema,
      base === undefined ? undefined : { base },
    )
  })
}
