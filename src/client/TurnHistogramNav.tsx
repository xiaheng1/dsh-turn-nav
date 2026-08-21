import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: activates ui-conversation's SlotMap declaration for the dock slot.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import {
  getTurnNavConfig,
  resolveRailSide,
  subscribeTurnNavConfig,
} from '../config.ts'
import css from './TurnHistogramNav.module.css'

type TurnHistogramNavProps = PropsRuntime<'conversation.composer.dock'>

interface TurnNavItem {
  readonly key: string
  readonly preview: string
  readonly kind: string
  /** Plain-text preview of the assistant reply that follows this turn. */
  readonly answer: string
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

/** Extract a plain-text preview from an assistant message node's blocks. */
function answerOf(node: { blocks?: readonly { kind?: string; text?: string }[] } | undefined): string {
  if (node?.blocks === undefined) return ''
  return node.blocks
    .filter((block): block is { kind: string; text: string } => block.kind === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join(' ')
    .trim()
}

/**
 * Turn histogram navigation rail.
 *
 * `mixed` is the current production look: short bars with a CSS wave and a
 * shared preview card. `deepseek` renders a thinner, more detached dash rail
 * with no wave at all: the bar keeps its length on hover/focus and only
 * changes colour (black on hover, blue on focus). `codex` renders a dense
 * left-hand tick rail aligned with the conversation column's left edge (the
 * DSH sidebar is draggable and collapsible, so the anchor is measured at
 * runtime — see the `railLeft` effect below — not a fixed offset), with edge
 * fade and a preview card on the right. All variants share the same data
 * source, click-to-scroll, and preview card.
 */
export function TurnHistogramNav({ useSession }: TurnHistogramNavProps) {
  const config = useSyncExternalStore(subscribeTurnNavConfig, getTurnNavConfig)
  const order = useSession(s => s.chat.order)
  const nodeStore = useSession(s => s.chat.nodes)

  const turns = useMemo<TurnNavItem[]>(() => {
    const result: TurnNavItem[] = []
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      const node = nodeStore.get(key)
      if (node?.kind !== 'user' && node?.kind !== 'steering') continue
      // The assistant reply: concatenate the text of every assistant-step
      // node between this turn and the next user/steering turn (a turn may
      // render several assistant steps, e.g. after tool calls, so all of them
      // belong to the same reply). The chat view registers the assistant row
      // under the `assistant-step` kind (not `assistant`, which is the kind of
      // the durable message node inside `data.finalNode`).
      let answer = ''
      for (let j = i + 1; j < order.length; j++) {
        const next = nodeStore.get(order[j])
        if (next === undefined) continue
        if (next.kind === 'user' || next.kind === 'steering') break
        if (next.kind === 'assistant-step') {
          const text = answerOf(next.data as { blocks?: readonly { kind?: string; text?: string }[] })
          if (text !== '') answer = answer === '' ? text : `${answer} ${text}`
        }
      }
      result.push({
        key,
        kind: node.kind,
        preview: previewOf(node.data as { content?: readonly { type?: string; text?: string }[] }),
        answer,
      })
    }
    return result
  }, [order, nodeStore])

  const [activeKey, setActiveKey] = useState<string | null>(null)
  // While true the preview card suppresses its `top` transition for one frame,
  // so opening it shows the card directly at the hovered row instead of flying
  // down from the top of the rail (where the collapsed card sits). Cleared a
  // tick later, so once open, row-to-row jumps keep their smooth slide.
  const [revealing, setRevealing] = useState(false)
  // Last hovered row index: closing the card fades it out in place instead of
  // snapping `top` back to the first row (the collapsed anchor), which is what
  // made the card appear to jump to the top tick while it faded.
  const lastIndexRef = useRef(0)
  // The turn the conversation is currently scrolled to. The DeepSeek dash
  // column highlights and jump-targets this row, so the rail always shows
  // where in the history you are — not just a hover state.
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const panelBodyRef = useRef<HTMLDivElement | null>(null)
  const turnsRef = useRef(turns)
  turnsRef.current = turns

  // The Codex rail sits at the conversation column's left edge; the DeepSeek
  // rail at its right edge. Neither is a fixed viewport offset: the DSH
  // sidebar is draggable (264–420px) and collapsible, and the conversation
  // column carries its own scrollbar. Measuring the scroller box keeps the
  // rail glued to the chat column — and clear of the scrollbar — instead of
  // overlapping it or hanging in space when the sidebar collapses.
  const [railLeft, setRailLeft] = useState<number | null>(null)
  const [railRight, setRailRight] = useState<number | null>(null)

  // DSH 应用主题（浅/深）。跟随 DSH 而非系统 prefers-color-scheme：读主题
  // token --dsw-alias-label-primary 的解析值判定（浅色基准 rgb(15,17,21)，
  // 深色为近白 rgb(249,250,251)）。驱动 deepseek 变体的深色覆盖
  // （CSS 侧 [data-tn-theme="dark"] 选择器）。
  const [dsTheme, setDsTheme] = useState<'light' | 'dark'>('light')

  // The rail only mounts once enough turns exist. The measurement effect must
  // (re)run whenever that visibility flips: on the initial mount with too few
  // turns the host is absent and the observer would never be registered.
  const isDeepseek = config.variant === 'deepseek'
  const isCodex = config.variant === 'codex'
  // Both DeepSeek and Codex keep a persistent current-turn marker (Codex:
  // the clicked/current tick stays near-black), so scroll tracking runs for
  // both variants.
  const tracksCurrent = isDeepseek || config.variant === 'codex'
  const railVisible = turns.length >= config.minTurns

  useLayoutEffect(() => {
    if (!railVisible) return
    const host = hostRef.current
    if (host === null) return
    const scroller = host.closest<HTMLElement>('[data-conversation-scroll]')
    if (scroller === null) return
    let raf: number | null = null
    const update = (): void => {
      raf ??= requestAnimationFrame(() => {
        raf = null
        const rect = scroller.getBoundingClientRect()
        setRailLeft(rect.left)
        // Right edge: align the rail to the left of the scroller's own
        // scrollbar (its width = offsetWidth − clientWidth), with a small gap,
        // so the rail never covers it.
        const scrollbarWidth = scroller.offsetWidth - scroller.clientWidth
        setRailRight(window.innerWidth - rect.right + scrollbarWidth + 8)
      })
    }
    update()
    // Sidebar drags and collapse/expand change the center column's width, which
    // is observed here; window resize covers auto-collapse at the breakpoint.
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [railVisible])

  // DSH 主题跟随：DSH 的主题 token（--dsw-alias-*）不一定定义在 <html> 上，
  // 常见于 <body> 或某个主题容器；因此逐层探测 host → body → html，取第一个
  // 能解析出 token 的层级。优先用 --dsw-alias-label-primary（浅色基准
  // rgb(15,17,21)/#0f1115，深色近白）；该 token 缺失时回退
  // --dsw-alias-bg-base（浅色白，深色深灰）。监听 <html> 与 <body> 的属性
  // 变化（切换主题必然改其一），resize 兜底。任一 token 无法解析时保守按浅色。
  useLayoutEffect(() => {
    const LIGHT_PRIMARY = new Set(['rgb(15,17,21)', '#0f1115'])
    const LIGHT_BG = new Set(['#fff', '#ffffff', 'white', 'rgb(255,255,255)'])
    const detectTheme = (): void => {
      const probe = hostRef.current ?? document.body ?? document.documentElement
      const computed = getComputedStyle(probe)
      const primary = computed
        .getPropertyValue('--dsw-alias-label-primary')
        .replace(/\s+/g, '')
        .toLowerCase()
      if (primary !== '') {
        setDsTheme(LIGHT_PRIMARY.has(primary) ? 'light' : 'dark')
        return
      }
      const bg = computed
        .getPropertyValue('--dsw-alias-bg-base')
        .replace(/\s+/g, '')
        .toLowerCase()
      setDsTheme(bg !== '' && !LIGHT_BG.has(bg) ? 'dark' : 'light')
    }
    detectTheme()
    const targets: Element[] = []
    if (document.documentElement !== null) targets.push(document.documentElement)
    if (document.body !== null) targets.push(document.body)
    const observer = new MutationObserver(detectTheme)
    for (const target of targets) observer.observe(target, { attributes: true })
    window.addEventListener('resize', detectTheme)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', detectTheme)
    }
  }, [])

  // Clear the one-frame reveal flag after the browser has painted the card at
  // its target position, so subsequent row-to-row transitions slide again.
  useEffect(() => {
    if (!revealing) return
    const id = window.setTimeout(() => setRevealing(false), 50)
    return () => window.clearTimeout(id)
  }, [revealing])

  // Track which turn the conversation viewport is currently at, so the
  // DeepSeek dash column / Codex tick rail can mark the active history
  // position. Codex's clicked tick stays near-black until the conversation
  // scrolls to another turn, matching the real client's current marker.
  // Rows are matched positionally: every `[data-chat-anchor-key]` row carries
  // `data-chat-flow-kind`, so filtering user/steering rows in DOM order yields
  // exactly the same sequence as `turns`. This does not depend on whether the
  // anchor attribute equals the node's map key.
  //
  // The scroller is re-resolved on every update: `[data-conversation-scroll]`
  // may not be the element that actually scrolls, so we walk up from it to the
  // first ancestor whose content overflows. Scroll events are captured at the
  // document level, so any nested scrollport (including the real scroller)
  // drives the probe.
  useLayoutEffect(() => {
    if (!railVisible || !tracksCurrent) return
    const host = hostRef.current
    if (host === null) return

    const resolveScroller = (): HTMLElement => {
      const anchor = host.closest<HTMLElement>('[data-conversation-scroll]') ?? host
      let el: HTMLElement | null = anchor
      while (el !== null) {
        if (el.scrollHeight > el.clientHeight) return el
        el = el.parentElement
      }
      return anchor
    }

    const update = (): void => {
      const scroller = resolveScroller()
      // Use a point slightly above the vertical centre as the "current" read.
      const probe = scroller.scrollTop + scroller.clientHeight * 0.4
      const turnsArr = turnsRef.current
      let current: string | null = null
      let idx = 0
      for (const row of scroller.querySelectorAll<HTMLElement>('[data-chat-anchor-key]')) {
        const kind = row.dataset.chatFlowKind
        if (kind !== 'user' && kind !== 'steering') continue
        if (idx >= turnsArr.length) break
        const top = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
        if (top > probe) break
        current = turnsArr[idx].key
        idx++
      }
      setCurrentKey(current)
    }
    // Capture fires for every nested scrollport, covering the case where the
    // real scroller is a deeper element than the anchor.
    document.addEventListener('scroll', update, { passive: true, capture: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      document.removeEventListener('scroll', update, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', update)
    }
  }, [railVisible, tracksCurrent])

  // Keep the current turn's dash visible. Row-to-row highlighting snaps
  // (DeepSeek's native behaviour); only the panel scroll animates: when the
  // conversation scrolls the current row outside the panel's visible area,
  // smooth-scroll the panel so the row's dash slides back into view — ideally
  // centred, since the target is the panel's midpoint.
  useLayoutEffect(() => {
    if (!isDeepseek || currentKey === null) return
    const body = panelBodyRef.current
    if (body === null) return
    const index = turns.findIndex(turn => turn.key === currentKey)
    if (index < 0) return
    const row = body.children[index] as HTMLElement | undefined
    if (row === undefined) return
    const rowTop = row.offsetTop
    if (rowTop < body.scrollTop || rowTop + row.offsetHeight > body.scrollTop + body.clientHeight) {
      body.scrollTo({ top: rowTop - body.clientHeight / 2, behavior: 'smooth' })
    }
  }, [currentKey, isDeepseek, turns])

  if (!railVisible) return null

  const activeIndex = activeKey === null ? -1 : turns.findIndex(turn => turn.key === activeKey)
  // While the card is closing (activeKey null) it keeps the last hovered row
  // for both position and content, so it fades out as a whole instead of first
  // turning into a blank card.
  const displayIndex = activeIndex >= 0 ? activeIndex : lastIndexRef.current

  const showPreview = (key: string): void => {
    // Opening from collapsed: the card must appear at the hovered row, not
    // slide down from the top — suppress the top transition for this frame.
    if (activeKey === null) setRevealing(true)
    setActiveKey(key)
    const idx = turns.findIndex(turn => turn.key === key)
    if (idx >= 0) lastIndexRef.current = idx
  }

  const hidePreview = (): void => {
    // Keep the preview while keyboard focus is still inside the rail, even if
    // the pointer has left it.
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement && activeElement.closest('[data-turn-nav-key]') !== null) return
    // Closing: same one-frame suppression so the fading card does not fly
    // back up to the collapsed position while it fades out.
    if (activeKey !== null) setRevealing(true)
    setActiveKey(null)
  }

  // Opening the panel: hovering the collapsed dash column seeds the active
  // row so the card pops open. Seed with the current conversation position
  // (falling back to the first turn), so the card opens on the row you are
  // actually reading.
  const handleRailEnter = (): void => {
    if (!isDeepseek || activeKey !== null) return
    const seed = currentKey ?? turns[0]?.key
    if (seed !== undefined) setActiveKey(seed)
  }

  // Collapsed-state click: the whole dash column is a jump button to the
  // current turn. Once expanded, individual rows handle their own clicks.
  const handlePanelClick = (): void => {
    if (!isDeepseek || activeKey !== null) return
    const target = currentKey ?? turns[0]?.key
    if (target !== undefined) scrollToTurn(target)
  }

  const scrollToTurn = (key: string): void => {
    // Click-to-navigate is an action, not a hover: close the preview right
    // away, otherwise the click's focus (which keeps `hidePreview` from
    // firing) would pin the card on screen until the user clicks elsewhere.
    setActiveKey(null)
    const rows = document.querySelectorAll<HTMLElement>('[data-chat-anchor-key]')
    for (const row of rows) {
      if (row.dataset.chatAnchorKey !== key) continue
      const scroller = row.closest<HTMLElement>('[data-conversation-scroll]')
      if (scroller !== null) {
        // ChatView keeps the conversation pinned to the bottom while its
        // "at bottom" state is true: a resize (streaming, image load) right
        // after the click snaps the smooth scroll back to the floor, so the
        // jump looks like a no-op until the user scrolls once. Re-issue the
        // scroll whenever that snap-back is detected during the first frames;
        // the first real move takes ChatView out of bottom-follow.
        const issueScroll = (): void => {
          const top = row.getBoundingClientRect().top
            - scroller.getBoundingClientRect().top
            + scroller.scrollTop
          scroller.scrollTo({ top: Math.max(0, top - config.scrollOffset), behavior: 'smooth' })
        }
        issueScroll()
        const floor = scroller.scrollHeight - scroller.clientHeight
        if (Math.abs(scroller.scrollTop - floor) <= 25) {
          let attempts = 0
          const interval = window.setInterval(() => {
            attempts += 1
            if (attempts > 6) {
              window.clearInterval(interval)
              return
            }
            if (Math.abs(scroller.scrollTop - (scroller.scrollHeight - scroller.clientHeight)) <= 25) {
              issueScroll()
            }
          }, 90)
          window.setTimeout(() => window.clearInterval(interval), 700)
        }
      } else {
        row.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
  }

  const railPaddingTop = 4
  const side = resolveRailSide(config)

  // Drive the CSS from the effective config via custom properties. Defaults
  // are also present in the stylesheet as fallbacks. Width animation (instead
  // of scaleX) keeps the rounded end caps perfectly circular while the bar
  // grows into the focused wave. Colour overrides come from `config.colors`;
  // unset fields fall through to the theme-aware defaults in the stylesheet.
  const colors = config.colors
  const style = {
    '--turn-nav-bar-width': `${config.barWidth}px`,
    '--turn-nav-focused-width': `${config.focusedBarWidth}px`,
    '--turn-nav-adjacent-width': `${config.adjacentBarWidth}px`,
    '--turn-nav-neighbor-width': `${config.neighborBarWidth}px`,
    '--turn-nav-wave-transition': `${config.waveTransitionMs}ms`,
    '--turn-nav-preview-width': `${config.previewWidth}px`,
    '--turn-nav-preview-max-height': `${config.previewMaxHeight}px`,
    '--turn-nav-rail-max-height': `${config.panelMaxHeight}px`,
    '--turn-nav-rail-right': `${config.railOffsetRight}px`,
    '--turn-nav-preview-gap': `${config.previewGap}px`,
    '--turn-nav-item-width': `${config.itemWidth}px`,
    '--turn-nav-item-height': `${config.itemHeight}px`,
    '--turn-nav-dot-size': `${config.dotSize}px`,
    '--turn-nav-rail-left': railLeft === null ? undefined : `${railLeft}px`,
    '--turn-nav-color-bar': colors.bar,
    '--turn-nav-color-bar-active': colors.barActive,
    '--turn-nav-color-bar-hover': colors.barHover,
    '--turn-nav-color-text': colors.text,
    '--turn-nav-color-text-active': colors.textActive,
    '--turn-nav-color-backdrop': colors.backdrop,
    '--turn-nav-color-panel-bg': colors.panelBackground,
    '--turn-nav-rail-right-measured': railRight === null ? undefined : `${railRight}px`,
  } as CSSProperties

  // The rail has 4px top padding; center the single shared preview on the
  // displayed item (the last hovered row while the card is fading out), so the
  // fade-out happens in place instead of jumping to the first-row anchor.
  const previewTop = railPaddingTop + displayIndex * config.itemHeight + config.itemHeight / 2

  return (
    <div ref={hostRef} className={css.host} style={style} data-variant={config.variant} data-side={side} data-tn-theme={dsTheme}>
      <nav
        className={css.rail}
        data-hide-narrow={config.hideOnNarrow ? 'true' : 'false'}
        aria-label="对话轮次导航"
        onMouseEnter={handleRailEnter}
        onMouseLeave={hidePreview}
        onClick={handlePanelClick}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hidePreview()
        }}
      >
        {isDeepseek
          ? (
            // DeepSeek: a single list renders both the resting dash column and
            // the expanded card — exactly like the real quick-nav. The panel
            // keeps its full width at all times: while collapsed it is
            // transparent (only the frosted .pill shows through the dash
            // column) and on hover it fades to the white card via a
            // background/shadow transition — no width jump. The inner
            // .panelBody carries the padding, scrolling and the top/bottom
            // fade, so the fade never touches the card itself. Dashes and
            // card rows are the same rows, perfectly aligned.
            <>
              <div className={css.pill} aria-hidden="true" />
              <div
                className={activeKey === null ? css.panel : `${css.panel} ${css.panelOpen}`}
                role="tooltip"
                aria-label="对话轮次清单"
              >
                <div ref={panelBodyRef} className={css.panelBody}>
                  {turns.map((turn, index) => {
                    const isActive = turn.key === activeKey
                    const isCurrent = turn.key === currentKey
                    const rowClass = [
                      css.panelRow,
                      isActive ? css.panelRowActive : '',
                      isCurrent ? css.panelRowCurrent : '',
                    ].filter(Boolean).join(' ')
                    return (
                      <button
                        key={turn.key}
                        type="button"
                        className={rowClass}
                        data-turn-nav-key={turn.key}
                        aria-label={`跳到第 ${index + 1} 轮`}
                        onMouseEnter={() => { showPreview(turn.key) }}
                        onFocus={() => { showPreview(turn.key) }}
                        onClick={(event) => {
                          event.currentTarget.blur()
                          scrollToTurn(turn.key)
                        }}
                      >
                        <span className={css.panelText}>{turn.preview || '（无文本内容）'}</span>
                        <span className={css.bar} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )
          : (
            <>
              <div className={css.tickColumn}>
              {turns.map((turn, index) => (
                <div
                  key={turn.key}
                  className={turn.key === currentKey ? `${css.item} ${css.itemCurrent}` : css.item}
                  data-turn-nav-key={turn.key}
                  onMouseEnter={() => { showPreview(turn.key) }}
                  onFocus={() => { showPreview(turn.key) }}
                >
                  <button
                    type="button"
                    className={css.lineButton}
                    aria-label={`跳到第 ${index + 1} 轮`}
                    onClick={(event) => {
                      // A click is a navigation action. Blur the button so the
                      // rail never keeps a latent focus that would pin the preview
                      // open after the pointer moves on (hidePreview preserves the
                      // preview only while focus is genuinely inside the rail).
                      event.currentTarget.blur()
                      scrollToTurn(turn.key)
                    }}
                  >
                    <span className={css.bar} />
                  </button>
                </div>
              ))}
              </div>
              {config.previewEnabled && (
                <div
                  className={`${css.preview}${activeKey !== null ? ` ${css.visible}` : ''}${revealing ? ` ${css.noTopTransition}` : ''}`}
                  role="tooltip"
                  aria-hidden={activeKey === null}
                  style={{ top: previewTop }}
                >
                  {isCodex ? (
                    <>
                      <span className={css.previewIndex}>{turns[displayIndex]?.preview || '（无文本内容）'}</span>
                      <span className={css.previewBody}>{turns[displayIndex]?.answer}</span>
                    </>
                  ) : (
                    <>
                      <span className={css.previewIndex}>{`第 ${displayIndex + 1} 轮`}</span>
                      {turns[displayIndex]?.preview || '（无文本内容）'}
                    </>
                  )}
                </div>
              )}
            </>
          )}
      </nav>
    </div>
  )
}
