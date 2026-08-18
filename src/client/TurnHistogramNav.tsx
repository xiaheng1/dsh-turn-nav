import { useMemo, useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: activates ui-conversation's SlotMap declaration for the dock slot.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import {
  getTurnNavConfig,
  subscribeTurnNavConfig,
} from '../config.ts'
import css from './TurnHistogramNav.module.css'

type TurnHistogramNavProps = PropsRuntime<'conversation.composer.dock'>

interface TurnNavItem {
  readonly key: string
  readonly preview: string
}

/** Extract a plain-text preview from a user/steering message node. */
function previewOf(node: { content?: readonly { type?: string; text?: string }[] } | undefined): string {
  if (node?.content === undefined) return ''
  return node.content
    .filter((block): block is { type: string; text: string } => block.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join(' ')
    .trim()
}

/**
 * Turn histogram navigation rail.
 *
 * Unfocused items render as short bars. Hovering or keyboard-focusing an item
 * grows it into the longest bar and forms a wave across its neighbours via
 * CSS-only selectors, so the wave follows the pointer without React state.
 * The focused item also shows the user message text next to the rail.
 * No `title` attribute is rendered, so the browser's native delayed tooltip
 * never appears.
 */
export function TurnHistogramNav({ useSession }: TurnHistogramNavProps) {
  const config = useSyncExternalStore(subscribeTurnNavConfig, getTurnNavConfig)
  const order = useSession(s => s.chat.order)
  const nodeStore = useSession(s => s.chat.nodes)

  const turns = useMemo<TurnNavItem[]>(() => order.flatMap((key) => {
    const node = nodeStore.get(key)
    if (node?.kind !== 'user' && node?.kind !== 'steering') return []
    return [{
      key,
      preview: previewOf(node.data as { content?: readonly { type?: string; text?: string }[] }),
    }]
  }), [order, nodeStore])

  const [activeKey, setActiveKey] = useState<string | null>(null)

  if (turns.length < config.minTurns) return null

  const activeIndex = activeKey === null ? -1 : turns.findIndex(turn => turn.key === activeKey)

  const showPreview = (key: string): void => {
    setActiveKey(key)
  }

  const hidePreview = (): void => {
    // Keep the preview while keyboard focus is still inside the rail, even if
    // the pointer has left it.
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement && activeElement.closest('[data-turn-nav-key]') !== null) return
    setActiveKey(null)
  }

  const scrollToTurn = (key: string): void => {
    const rows = document.querySelectorAll<HTMLElement>('[data-chat-anchor-key]')
    for (const row of rows) {
      if (row.dataset.chatAnchorKey !== key) continue
      const scroller = row.closest<HTMLElement>('[data-conversation-scroll]')
      if (scroller !== null) {
        const top = row.getBoundingClientRect().top
          - scroller.getBoundingClientRect().top
          + scroller.scrollTop
        scroller.scrollTo({ top: Math.max(0, top - config.scrollOffset), behavior: 'smooth' })
      } else {
        row.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
  }

  const railPaddingTop = 4

  // Drive the CSS from the effective config via custom properties. Defaults
  // are also present in the stylesheet as fallbacks. Width animation (instead
  // of scaleX) keeps the rounded end caps perfectly circular while the bar
  // grows into the focused wave.
  const style = {
    '--turn-nav-bar-width': `${config.barWidth}px`,
    '--turn-nav-focused-width': `${config.focusedBarWidth}px`,
    '--turn-nav-adjacent-width': `${config.adjacentBarWidth}px`,
    '--turn-nav-neighbor-width': `${config.neighborBarWidth}px`,
    '--turn-nav-wave-transition': `${config.waveTransitionMs}ms`,
    '--turn-nav-preview-width': `${config.previewWidth}px`,
    '--turn-nav-preview-max-height': `${config.previewMaxHeight}px`,
    '--turn-nav-rail-right': `${config.railOffsetRight}px`,
    '--turn-nav-preview-gap': `${config.previewGap}px`,
    '--turn-nav-item-width': `${config.itemWidth}px`,
    '--turn-nav-item-height': `${config.itemHeight}px`,
  } as CSSProperties

  // The rail has 4px top padding; center the single shared preview on the
  // active item using the configured item height.
  const previewTop = activeIndex >= 0
    ? railPaddingTop + activeIndex * config.itemHeight + config.itemHeight / 2
    : railPaddingTop + config.itemHeight / 2

  return (
    <div className={css.host} style={style}>
      <nav
        className={css.rail}
        data-hide-narrow={config.hideOnNarrow ? 'true' : 'false'}
        aria-label="对话轮次导航"
        onMouseLeave={hidePreview}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hidePreview()
        }}
      >
        {turns.map((turn, index) => (
          <div
            key={turn.key}
            className={css.item}
            data-turn-nav-key={turn.key}
            onMouseEnter={() => { showPreview(turn.key) }}
            onFocus={() => { showPreview(turn.key) }}
          >
            <button
              type="button"
              className={css.lineButton}
              aria-label={`跳到第 ${index + 1} 轮`}
              onClick={() => { scrollToTurn(turn.key) }}
            >
              <span className={css.bar} />
            </button>
          </div>
        ))}
        {config.previewEnabled && (
          <div
            className={activeKey === null ? css.preview : `${css.preview} ${css.visible}`}
            role="tooltip"
            aria-hidden={activeKey === null}
            style={{ top: previewTop }}
          >
            <span className={css.previewIndex}>第 {activeIndex + 1} 轮</span>
            {activeIndex >= 0 ? (turns[activeIndex]?.preview || '（无文本内容）') : ''}
          </div>
        )}
      </nav>
    </div>
  )
}
