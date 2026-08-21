/**
 * Shared configuration for dsh-turn-nav.
 *
 * This module is intentionally browser-safe and dependency-free: the client
 * bundle reads defaults and merges user settings, while the node half uses the
 * same types/defaults when registering the DSH settings namespace.
 *
 * The shape is forward-compatible: `position` resolves each variant's natural
 * placement, and `colors` holds theme-token overrides. Every new field is
 * optional with a sensible fallback, so existing configurations keep working.
 */

/** DSH settings namespace owned by this plugin. */
export const TURN_NAV_NAMESPACE = 'dsh-turn-nav'

/** Visual variant of the turn navigation rail. */
export type TurnNavVariant = 'mixed' | 'deepseek' | 'codex'

/**
 * Which screen edge the rail hugs.
 *
 * `default` keeps the variant's natural placement (mixed/deepseek → right,
 * codex → left). `left`/`right` force the side regardless of variant.
 */
export type TurnNavPosition = 'default' | 'left' | 'right'

/**
 * Colour overrides for the rail. Every value is a raw CSS colour or a DSH
 * design token such as `var(--dsw-alias-label-tertiary)`. Leave a field
 * undefined to inherit the variant's theme-aware default, so the rail follows
 * the active DSH theme (light/dark) out of the box.
 */
export interface TurnNavColors {
  /** Resting bar / dash colour. */
  bar?: string
  /** Current turn marker colour (DeepSeek: the scroll-tracked blue dash). */
  barActive?: string
  /** Hovered / focused bar colour (DeepSeek: near-black dash). */
  barHover?: string
  /** Preview / panel text colour. */
  text?: string
  /** Active-row text colour (DeepSeek panel). */
  textActive?: string
  /** Resting backdrop pill behind the DeepSeek dash column. */
  backdrop?: string
  /** Panel / preview card background. */
  panelBackground?: string
}

/** Effective visual/behavior settings for the turn navigation rail. */
export interface TurnNavConfig {
  /** Visual variant: current mixed style, DeepSeek dash style, or Codex tick style. */
  variant: TurnNavVariant
  /** Which edge the rail hugs; `default` resolves to the variant's natural side. */
  position: TurnNavPosition
  /** Resting bar width in px (also used as Codex tick width when variant is codex). */
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
  /** Scrollable panel maximum height in px (DeepSeek list card). */
  panelMaxHeight: number
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
  /** Codex variant tick height in px. Kept for backward compatibility. */
  dotSize: number
  /** Extra scroll offset when jumping to a turn in px. */
  scrollOffset: number
  /** Colour overrides; unset fields follow the DSH theme. */
  colors: TurnNavColors
}

/** Defaults for the mixed wave style. */
export const DEFAULT_TURN_NAV_CONFIG: TurnNavConfig = {
  variant: 'mixed',
  position: 'default',
  barWidth: 12,
  focusedBarWidth: 24,
  adjacentBarWidth: 16,
  neighborBarWidth: 13,
  waveTransitionMs: 100,
  previewEnabled: true,
  previewWidth: 240,
  previewMaxHeight: 132,
  panelMaxHeight: 300,
  minTurns: 1,
  hideOnNarrow: true,
  railOffsetRight: 8,
  previewGap: 10,
  itemWidth: 28,
  itemHeight: 14,
  dotSize: 8,
  scrollOffset: 16,
  colors: {},
}

/** Each variant's natural rail side. */
export const VARIANT_POSITION: Record<TurnNavVariant, 'left' | 'right'> = {
  mixed: 'right',
  deepseek: 'right',
  codex: 'left',
}

/**
 * Per-variant recommended defaults.
 *
 * The component reads these through `resolveTurnNavConfig`, so each variant
 * starts from dimensions and timing that match its design language, while still
 * allowing the user to override individual values.
 */
export const VARIANT_DEFAULTS: Record<TurnNavVariant, TurnNavConfig> = {
  mixed: { ...DEFAULT_TURN_NAV_CONFIG, variant: 'mixed' },
  deepseek: {
    ...DEFAULT_TURN_NAV_CONFIG,
    variant: 'deepseek',
    // Calibrated to the real DSH session quick-nav (measured on the live
    // page): fixed 8px × 2px dash, 30px row pitch, 34px click column, rail
    // 16px from the right edge. No width change on hover/focus (no wave);
    // the active row only darkens.
    barWidth: 8,
    focusedBarWidth: 8,
    adjacentBarWidth: 8,
    neighborBarWidth: 8,
    itemWidth: 34,
    itemHeight: 30,
    railOffsetRight: 16,
    waveTransitionMs: 200,
  },
  codex: {
    ...DEFAULT_TURN_NAV_CONFIG,
    variant: 'codex',
    // Calibrated to the real Codex client navigation rail, cross-validated
    // between the light (150% scale) and dark (200% scale) screenshots — the
    // same client, so the CSS values must agree (2026-08). Unified spec:
    // resting tick 6×2px grey, 10px row pitch; hovering/focusing lengthens the
    // tick plus the three ticks on each side (7 in total) to 26 / 20 / 14 / 10
    // and turns only the hovered tick into the theme's strongest foreground
    // (near-black in light, near-white in dark). Neighbours stay grey.
    barWidth: 6,
    focusedBarWidth: 26,
    adjacentBarWidth: 20,
    neighborBarWidth: 14,
    // Dense tick rail: 30px click column (wider than the 26px focused tick so
    // the preview card clears the extended bar), 10px row pitch.
    itemWidth: 30,
    itemHeight: 10,
    dotSize: 2,
    // Measured from the real Codex client card (642 physical px @200% = 321
    // CSS; 20 physical px gap = 10 CSS). The card shows the user's message on
    // line 1 and the assistant reply below; 106px max height = title + up to
    // 3 body lines at 13px/20px.
    previewWidth: 321,
    previewMaxHeight: 106,
    // 7-tick wave (self + 3 on each side) — slower than mixed's 3-tick wave
    // (100ms) so the length taper reads as soft and gradual.
    waveTransitionMs: 150,
  },
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

/** Accept only a non-empty string; anything else falls back to undefined. */
function resolveColor(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

/** Sanitize the colours bag, dropping non-string entries. */
function resolveColors(value: unknown): TurnNavColors {
  if (typeof value !== 'object' || value === null) return {}
  const raw = value as Partial<Record<keyof TurnNavColors, unknown>>
  const out: TurnNavColors = {}
  const bar = resolveColor(raw.bar)
  const barActive = resolveColor(raw.barActive)
  const barHover = resolveColor(raw.barHover)
  const text = resolveColor(raw.text)
  const textActive = resolveColor(raw.textActive)
  const backdrop = resolveColor(raw.backdrop)
  const panelBackground = resolveColor(raw.panelBackground)
  if (bar !== undefined) out.bar = bar
  if (barActive !== undefined) out.barActive = barActive
  if (barHover !== undefined) out.barHover = barHover
  if (text !== undefined) out.text = text
  if (textActive !== undefined) out.textActive = textActive
  if (backdrop !== undefined) out.backdrop = backdrop
  if (panelBackground !== undefined) out.panelBackground = panelBackground
  return out
}

function resolvePosition(value: unknown): TurnNavPosition {
  return value === 'left' || value === 'right' ? value : 'default'
}

/** Resolve the rail's concrete side, honouring the explicit position override. */
export function resolveRailSide(config: TurnNavConfig): 'left' | 'right' {
  return config.position === 'default' ? VARIANT_POSITION[config.variant] : config.position
}

/** Merge a partial/user value over defaults and clamp unsafe numeric ranges. */
export function resolveTurnNavConfig(input: unknown): TurnNavConfig {
  const raw = (typeof input === 'object' && input !== null ? input : {}) as Partial<Record<keyof TurnNavConfig, unknown>>
  const variant: TurnNavVariant = raw.variant === 'deepseek' || raw.variant === 'codex' ? raw.variant : 'mixed'
  const defaults = VARIANT_DEFAULTS[variant]
  return {
    variant,
    position: resolvePosition(raw.position),
    barWidth: clampNumber(raw.barWidth, defaults.barWidth, 4, 40),
    focusedBarWidth: clampNumber(raw.focusedBarWidth, defaults.focusedBarWidth, 4, 80),
    adjacentBarWidth: clampNumber(raw.adjacentBarWidth, defaults.adjacentBarWidth, 4, 80),
    neighborBarWidth: clampNumber(raw.neighborBarWidth, defaults.neighborBarWidth, 4, 80),
    waveTransitionMs: clampNumber(raw.waveTransitionMs, defaults.waveTransitionMs, 0, 2000),
    previewEnabled: resolveBoolean(raw.previewEnabled, defaults.previewEnabled),
    previewWidth: clampNumber(raw.previewWidth, defaults.previewWidth, 120, 720),
    previewMaxHeight: clampNumber(raw.previewMaxHeight, defaults.previewMaxHeight, 48, 960),
    panelMaxHeight: clampNumber(raw.panelMaxHeight, defaults.panelMaxHeight, 48, 960),
    minTurns: clampNumber(raw.minTurns, defaults.minTurns, 1, 100),
    hideOnNarrow: resolveBoolean(raw.hideOnNarrow, defaults.hideOnNarrow),
    railOffsetRight: clampNumber(raw.railOffsetRight, defaults.railOffsetRight, 0, 120),
    previewGap: clampNumber(raw.previewGap, defaults.previewGap, 0, 120),
    itemWidth: clampNumber(raw.itemWidth, defaults.itemWidth, 12, 120),
    itemHeight: clampNumber(raw.itemHeight, defaults.itemHeight, 4, 64),
    dotSize: clampNumber(raw.dotSize, defaults.dotSize, 2, 32),
    scrollOffset: clampNumber(raw.scrollOffset, defaults.scrollOffset, 0, 240),
    colors: resolveColors(raw.colors),
  }
}

/**
 * Tiny synchronous store for the effective client config.
 *
 * The DSH settings scope loads asynchronously; the component reads this store
 * through `useSyncExternalStore` so a settings update re-renders the rail.
 * External tools can use `getTurnNavConfig`/`applyTurnNavConfig` directly.
 *
 * The store keeps only a *sparse* set of explicitly configured fields
 * (`userOverrides`) and never stores a fully-resolved config as the override
 * layer. The settings scope resolves every field to a concrete value (base
 * layer + schema defaults); if those were carried across a variant switch,
 * the previous variant's dimensions would pin the new variant instead of
 * letting `VARIANT_DEFAULTS` re-baseline. Every resolution therefore starts
 * from the current variant's baseline and layers the explicit overrides on
 * top, so `updateConfig({ variant: 'codex' })` yields the codex dimensions
 * rather than the mixed ones the base layer happens to pin.
 */
let effectiveConfig: TurnNavConfig = resolveTurnNavConfig({})
let userOverrides: Partial<TurnNavConfig> = {}
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

/** Resolve the override layer against the variant baseline it implies. */
function resolveConfig(): TurnNavConfig {
  const variant: TurnNavVariant =
    userOverrides.variant === 'deepseek' || userOverrides.variant === 'codex'
      ? userOverrides.variant
      : 'mixed'
  return resolveTurnNavConfig({ ...VARIANT_DEFAULTS[variant], ...userOverrides })
}

/** @returns the current effective config (stable until the next update). */
export function getTurnNavConfig(): Readonly<TurnNavConfig> {
  return effectiveConfig
}

/** Replace the explicit override layer from a (sparse) settings snapshot. */
export function setTurnNavConfig(config: Partial<TurnNavConfig>): void {
  userOverrides = { ...config }
  effectiveConfig = resolveConfig()
  emit()
}

/** Merge a partial patch over the explicit override layer. */
export function applyTurnNavConfig(patch: Partial<TurnNavConfig>): void {
  userOverrides = { ...userOverrides, ...patch }
  effectiveConfig = resolveConfig()
  emit()
}

/** Clear every explicit override, returning to the variant's defaults. */
export function resetTurnNavConfig(): void {
  userOverrides = {}
  effectiveConfig = resolveConfig()
  emit()
}

/** Subscribe to effective config changes. */
export function subscribeTurnNavConfig(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
