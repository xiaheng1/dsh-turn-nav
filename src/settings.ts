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
  type TurnNavConfig,
} from './config.ts'

/**
 * Schemastery schema used by DSH settings to validate and render the section.
 *
 * Only `variant` (and `position`) carry a default. The visual fields are
 * intentionally *without* defaults: their baseline is the active variant's
 * `VARIANT_DEFAULTS`, which the client resolves at runtime. If the schema
 * pinned concrete values here (e.g. mixed's 12px bars), switching the variant
 * through the settings document would keep those pinned dimensions instead of
 * re-baselining on the new variant's defaults. Sparse fields flow through to
 * `resolveTurnNavConfig`, which fills the variant baseline.
 */
export const TurnNavConfigSchema: Schema<TurnNavConfig> = Schema.object({
  variant: Schema.union(['mixed', 'deepseek', 'codex']).default(DEFAULT_TURN_NAV_CONFIG.variant),
  position: Schema.union(['default', 'left', 'right']).default(DEFAULT_TURN_NAV_CONFIG.position),
  barWidth: Schema.number().min(4).max(40),
  focusedBarWidth: Schema.number().min(4).max(80),
  adjacentBarWidth: Schema.number().min(4).max(80),
  neighborBarWidth: Schema.number().min(4).max(80),
  waveTransitionMs: Schema.number().min(0).max(2000),
  previewEnabled: Schema.boolean(),
  previewWidth: Schema.number().min(120).max(720),
  previewMaxHeight: Schema.number().min(48).max(960),
  panelMaxHeight: Schema.number().min(48).max(960),
  minTurns: Schema.number().min(1).max(100),
  hideOnNarrow: Schema.boolean(),
  railOffsetRight: Schema.number().min(0).max(120),
  previewGap: Schema.number().min(0).max(120),
  itemWidth: Schema.number().min(12).max(120),
  itemHeight: Schema.number().min(8).max(64),
  dotSize: Schema.number().min(4).max(32),
  scrollOffset: Schema.number().min(0).max(240),
  colors: Schema.object({
    bar: Schema.string(),
    barActive: Schema.string(),
    barHover: Schema.string(),
    text: Schema.string(),
    textActive: Schema.string(),
    backdrop: Schema.string(),
    panelBackground: Schema.string(),
  }),
})

/**
 * Load the repository-root config file as the settings composition base.
 * Returns the file's raw (sparse) fields, not a fully-resolved config: a full
 * base would pin every visual field and defeat the variant-aware defaults.
 */
function loadConfigFile(): Partial<TurnNavConfig> | undefined {
  const configUrl = new URL('../dsh-turn-nav.config.json', import.meta.url)
  const configPath = fileURLToPath(configUrl)
  if (!existsSync(configPath)) return undefined
  try {
    const raw: unknown = JSON.parse(readFileSync(configPath, 'utf8'))
    return raw as Partial<TurnNavConfig>
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
