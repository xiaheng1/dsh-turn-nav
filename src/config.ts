/**
 * Shared configuration for dsh-turn-nav.
 *
 * This module is intentionally browser-safe and dependency-free: the client
 * bundle reads defaults and merges user settings, while the node half uses the
 * same types/defaults when registering the DSH settings namespace.
 */

/** DSH settings namespace owned by this plugin. */
export const TURN_NAV_NAMESPACE = 'dsh-turn-nav'

/** Visual variant of the turn navigation rail. */
export type TurnNavVariant = 'mixed' | 'deepseek' | 'codex'

/** Effective visual/behavior settings for the turn navigation rail. */
export interface TurnNavConfig {
  /** Visual variant: current mixed style, DeepSeek dash style, or Codex dot style. */
  variant: TurnNavVariant
  /** Resting bar width in px (also used as Codex dot size when variant is codex). */
  barWidth: number
  /** Focused (hovered/focused) bar width in px. */
  focusedBarWidth: number
  /** First adjacent bar width in px. */
  adjacentBarWidth: number
  /** Second adjacent bar width in px. */
  neighborBarWidth: number
  /**
   * Wave transition duration in ms.
   *
   * Shorter values feel harder/snappier; longer values feel softer/smoother.
   */
  waveTransitionMs: number
  /** Whether to show the message preview card. */
  previewEnabled: boolean
  /** Preview card width in px. */
  previewWidth: number
  /** Preview card maximum height in px before overflow is hidden. */
  previewMaxHeight: number
  /** Minimum number of user turns before the rail appears. */
  minTurns: number
  /** Hide the rail on narrow screens (max-width: 767px). */
  hideOnNarrow: boolean
  /** Rail distance from the right edge in px. */
  railOffsetRight: number
  /** Gap between the rail and the preview card in px. */
  previewGap: number
  /** Click target / item width in px. */
  itemWidth: number
  /** Item height in px. */
  itemHeight: number
  /** Codex variant dot diameter in px. */
  dotSize: number
  /** Extra scroll offset when jumping to a turn in px. */
  scrollOffset: number
}

/** Defaults keep the original bar feel while making the focused wave softer and rounder. */
export const DEFAULT_TURN_NAV_CONFIG: TurnNavConfig = {
  variant: 'mixed',
  barWidth: 12,
  focusedBarWidth: 24,
  adjacentBarWidth: 16,
  neighborBarWidth: 13,
  waveTransitionMs: 100,
  previewEnabled: true,
  previewWidth: 240,
  previewMaxHeight: 132,
  minTurns: 1,
  hideOnNarrow: true,
  railOffsetRight: 8,
  previewGap: 10,
  itemWidth: 28,
  itemHeight: 14,
  dotSize: 8,
  scrollOffset: 16,
}

function clampNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback
}

function resolveBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

/** Merge a partial/user value over defaults and clamp unsafe numeric ranges. */
export function resolveTurnNavConfig(input: unknown): TurnNavConfig {
  const raw = (typeof input === 'object' && input !== null ? input : {}) as Partial<Record<keyof TurnNavConfig, unknown>>
  const defaults = DEFAULT_TURN_NAV_CONFIG
  return {
    variant: raw.variant === 'deepseek' || raw.variant === 'codex' ? raw.variant : 'mixed',
    barWidth: clampNumber(raw.barWidth, defaults.barWidth, 4, 40),
    focusedBarWidth: clampNumber(raw.focusedBarWidth, defaults.focusedBarWidth, 4, 80),
    adjacentBarWidth: clampNumber(raw.adjacentBarWidth, defaults.adjacentBarWidth, 4, 80),
    neighborBarWidth: clampNumber(raw.neighborBarWidth, defaults.neighborBarWidth, 4, 80),
    waveTransitionMs: clampNumber(raw.waveTransitionMs, defaults.waveTransitionMs, 0, 2000),
    previewEnabled: resolveBoolean(raw.previewEnabled, defaults.previewEnabled),
    previewWidth: clampNumber(raw.previewWidth, defaults.previewWidth, 120, 720),
    previewMaxHeight: clampNumber(raw.previewMaxHeight, defaults.previewMaxHeight, 48, 960),
    minTurns: clampNumber(raw.minTurns, defaults.minTurns, 1, 100),
    hideOnNarrow: resolveBoolean(raw.hideOnNarrow, defaults.hideOnNarrow),
    railOffsetRight: clampNumber(raw.railOffsetRight, defaults.railOffsetRight, 0, 120),
    previewGap: clampNumber(raw.previewGap, defaults.previewGap, 0, 120),
    itemWidth: clampNumber(raw.itemWidth, defaults.itemWidth, 12, 120),
    itemHeight: clampNumber(raw.itemHeight, defaults.itemHeight, 8, 64),
    dotSize: clampNumber(raw.dotSize, defaults.dotSize, 4, 32),
    scrollOffset: clampNumber(raw.scrollOffset, defaults.scrollOffset, 0, 240),
  }
}

/**
 * Tiny synchronous store for the effective client config.
 *
 * The DSH settings scope loads asynchronously; the component reads this store
 * through `useSyncExternalStore` so a settings update re-renders the rail.
 * External tools can use `getTurnNavConfig`/`applyTurnNavConfig` directly.
 */
let effectiveConfig: TurnNavConfig = DEFAULT_TURN_NAV_CONFIG
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

/** @returns the current effective config (stable until the next update). */
export function getTurnNavConfig(): Readonly<TurnNavConfig> {
  return effectiveConfig
}

/** Replace the effective config with a resolved copy. */
export function setTurnNavConfig(config: TurnNavConfig): void {
  effectiveConfig = resolveTurnNavConfig(config)
  emit()
}

/** Merge a partial patch over the current effective config. */
export function applyTurnNavConfig(patch: Partial<TurnNavConfig>): void {
  setTurnNavConfig(resolveTurnNavConfig({ ...effectiveConfig, ...patch }))
}

/** Subscribe to effective config changes. */
export function subscribeTurnNavConfig(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
