import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Schema from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
//#region lib/types/config.js
/**
* Shared configuration for dsh-turn-nav.
*
* This module is intentionally browser-safe and dependency-free: the client
* bundle reads defaults and merges user settings, while the node half uses the
* same types/defaults when registering the DSH settings namespace.
*/
/** DSH settings namespace owned by this plugin. */
const TURN_NAV_NAMESPACE = "dsh-turn-nav";
/** Defaults keep the original bar feel while making the focused wave softer and rounder. */
const DEFAULT_TURN_NAV_CONFIG = {
	variant: "mixed",
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
	scrollOffset: 16
};
function clampNumber(value, fallback, min, max) {
	return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
function resolveBoolean(value, fallback) {
	return typeof value === "boolean" ? value : fallback;
}
/** Merge a partial/user value over defaults and clamp unsafe numeric ranges. */
function resolveTurnNavConfig(input) {
	const raw = typeof input === "object" && input !== null ? input : {};
	const defaults = DEFAULT_TURN_NAV_CONFIG;
	return {
		variant: raw.variant === "deepseek" || raw.variant === "codex" ? raw.variant : "mixed",
		barWidth: clampNumber(raw.barWidth, defaults.barWidth, 4, 40),
		focusedBarWidth: clampNumber(raw.focusedBarWidth, defaults.focusedBarWidth, 4, 80),
		adjacentBarWidth: clampNumber(raw.adjacentBarWidth, defaults.adjacentBarWidth, 4, 80),
		neighborBarWidth: clampNumber(raw.neighborBarWidth, defaults.neighborBarWidth, 4, 80),
		waveTransitionMs: clampNumber(raw.waveTransitionMs, defaults.waveTransitionMs, 0, 2e3),
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
		scrollOffset: clampNumber(raw.scrollOffset, defaults.scrollOffset, 0, 240)
	};
}
//#endregion
//#region lib/types/settings.js
/**
* Node-half settings registration for dsh-turn-nav.
*
* Registers the plugin's configuration namespace with DSH's user-settings
* document (`settings.yaml` / `settings.json`). The repository-root
* `dsh-turn-nav.config.json` is loaded as the composition `base` layer, so it
* is the obvious place to change plugin defaults; DSH user settings still win
* over it when both are present.
*/
/** Schemastery schema used by DSH settings to validate and render the section. */
const TurnNavConfigSchema = Schema.object({
	variant: Schema.union([
		"mixed",
		"deepseek",
		"codex"
	]).default(DEFAULT_TURN_NAV_CONFIG.variant),
	barWidth: Schema.number().min(4).max(40).default(DEFAULT_TURN_NAV_CONFIG.barWidth),
	focusedBarWidth: Schema.number().min(4).max(80).default(DEFAULT_TURN_NAV_CONFIG.focusedBarWidth),
	adjacentBarWidth: Schema.number().min(4).max(80).default(DEFAULT_TURN_NAV_CONFIG.adjacentBarWidth),
	neighborBarWidth: Schema.number().min(4).max(80).default(DEFAULT_TURN_NAV_CONFIG.neighborBarWidth),
	waveTransitionMs: Schema.number().min(0).max(2e3).default(DEFAULT_TURN_NAV_CONFIG.waveTransitionMs),
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
	scrollOffset: Schema.number().min(0).max(240).default(DEFAULT_TURN_NAV_CONFIG.scrollOffset)
});
/** Load the repository-root config file as the settings composition base. */
function loadConfigFile() {
	const configPath = fileURLToPath(new URL("../dsh-turn-nav.config.json", import.meta.url));
	if (!existsSync(configPath)) return void 0;
	try {
		return resolveTurnNavConfig(JSON.parse(readFileSync(configPath, "utf8")));
	} catch (error) {
		console.warn(`[dsh-turn-nav] failed to read ${configPath}; using built-in defaults.`, error);
		return;
	}
}
/**
* Register the namespace when a settings provider exists.
* @param ctx - host context.
*/
function apply$1(ctx) {
	const base = loadConfigFile();
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(settingsNamespace(TURN_NAV_NAMESPACE), TurnNavConfigSchema, base === void 0 ? void 0 : { base });
	});
}
//#endregion
//#region lib/types/index.js
function apply(ctx) {
	apply$1(ctx);
}
//#endregion
export { DEFAULT_TURN_NAV_CONFIG, TURN_NAV_NAMESPACE, apply };
