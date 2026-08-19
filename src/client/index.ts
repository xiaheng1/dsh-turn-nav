/**
 * Web turn-nav plugin, browser half.
 *
 * Registers a low-profile histogram rail into the existing
 * `conversation.composer.dock` list slot. The rail renders as a fixed overlay
 * on the right edge, so no conversation core change is required.
 *
 * The browser half also binds the plugin's DSH settings namespace and exposes
 * a small `turnNav` service (plus `window.dshTurnNav`) so external settings
 * UIs, commands, or scripts can read and update the effective configuration.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls ui-conversation's SlotMap declarations into this program.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the settingsScope Context merge (ctx.settingsScope).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  DEFAULT_TURN_NAV_CONFIG,
  TURN_NAV_NAMESPACE,
  applyTurnNavConfig,
  getTurnNavConfig,
  setTurnNavConfig,
  type TurnNavConfig,
} from '../config.ts'
import { TurnHistogramNav } from './TurnHistogramNav.tsx'

/** Public client-side configuration handle for dsh-turn-nav. */
export interface TurnNavClient {
  /** Read the currently effective configuration (defaults + user settings). */
  getConfig(): Readonly<TurnNavConfig>
  /** Persist a partial configuration patch through DSH settings. */
  updateConfig(patch: Partial<TurnNavConfig>): Promise<void>
  /** Clear every user override so the schema defaults apply again. */
  resetConfig(): Promise<void>
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Configuration handle provided by dsh-turn-nav's browser half. */
    turnNav: TurnNavClient
  }
}

/** Required services: slots, the settings-namespace scope, and its transport dependencies. */
export const inject = ['slots', 'settingsScope', 'connection', 'remote']

/**
 * Client plugin body.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  const scope = ctx.settingsScope.bind<TurnNavConfig>({ namespace: TURN_NAV_NAMESPACE })

  const syncConfig = (): void => {
    const value = scope.getSnapshot().value
    if (value !== undefined) setTurnNavConfig(value)
  }
  syncConfig()
  const unsubscribe = scope.subscribe(syncConfig)
  ctx.effect(() => unsubscribe, 'dsh-turn-nav: settings scope')

  const service: TurnNavClient = {
    getConfig: () => getTurnNavConfig(),
    async updateConfig(patch) {
      // Update the local effective config immediately so the console API works
      // even when the DSH settings namespace is not exposed to this client yet.
      applyTurnNavConfig(patch)
      for (const [field, value] of Object.entries(patch)) {
        await scope.set(field, value)
      }
    },
    async resetConfig() {
      setTurnNavConfig(DEFAULT_TURN_NAV_CONFIG)
      for (const field of Object.keys(DEFAULT_TURN_NAV_CONFIG)) {
        await scope.unset(field)
      }
    },
  }
  ctx.reflect.provide('turnNav', service)
  if (typeof window !== 'undefined') {
    ;(window as unknown as { dshTurnNav?: TurnNavClient }).dshTurnNav = service
  }

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
    { name: 'conversation.composer.dock', id: 'ui-turn-nav' },
    TurnHistogramNav,
  ))
}
