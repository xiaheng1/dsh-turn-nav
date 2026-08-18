import { useMemo, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: activates ui-conversation's SlotMap declaration for the dock slot.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
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

  // Trial: show even with one user turn so it is easy to verify.
  // TODO: restore the spec threshold (>=2) after the trial.
  if (turns.length < 1) return null

  const [activeKey, setActiveKey] = useState<string | null>(null)
  const activeIndex = activeKey === null ? -1 : turns.findIndex(turn => turn.key === activeKey)

  const showPreview = (key: string): void => {
    setActiveKey(key)
  }

  const hidePreview = (): void => {
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
        scroller.scrollTo({ top: Math.max(0, top - 16), behavior: 'smooth' })
      } else {
        row.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
  }

  // The rail has 4px top padding and each item is 14px tall with no gap.
  // Center the single shared preview on the active item.
  const previewTop = activeIndex >= 0 ? 11 + activeIndex * 14 : 11

  return (
    <div className={css.host}>
      <nav
        className={css.rail}
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
        <div
          className={activeKey === null ? css.preview : `${css.preview} ${css.visible}`}
          role="tooltip"
          aria-hidden={activeKey === null}
          style={{ top: previewTop }}
        >
          <span className={css.previewIndex}>第 {activeIndex + 1} 轮</span>
          {activeIndex >= 0 ? (turns[activeIndex]?.preview || '（无文本内容）') : ''}
        </div>
      </nav>
    </div>
  )
}
