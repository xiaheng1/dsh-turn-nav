/**
 * Web turn-nav plugin, browser half.
 *
 * Registers a low-profile histogram rail into the existing
 * `conversation.composer.dock` list slot. The rail renders as a fixed overlay
 * on the right edge, so no conversation core change is required.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls ui-conversation's SlotMap declarations into this program.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { TurnHistogramNav } from './TurnHistogramNav.tsx'

/** Required services: the slot registry. */
export const inject = ['slots']

/**
 * Client plugin body.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
    { name: 'conversation.composer.dock', id: 'ui-turn-nav' },
    TurnHistogramNav,
  ))
}
