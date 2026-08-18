window.__ModuleLoader__.load({
	id: "dsh-turn-nav",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/config.ts
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
				scrollOffset: clampNumber(raw.scrollOffset, defaults.scrollOffset, 0, 240)
			};
		}
		/**
		* Tiny synchronous store for the effective client config.
		*
		* The DSH settings scope loads asynchronously; the component reads this store
		* through `useSyncExternalStore` so a settings update re-renders the rail.
		* External tools can use `getTurnNavConfig`/`applyTurnNavConfig` directly.
		*/
		let effectiveConfig = DEFAULT_TURN_NAV_CONFIG;
		const listeners = /* @__PURE__ */ new Set();
		function emit() {
			for (const listener of listeners) listener();
		}
		/** @returns the current effective config (stable until the next update). */
		function getTurnNavConfig() {
			return effectiveConfig;
		}
		/** Replace the effective config with a resolved copy. */
		function setTurnNavConfig(config) {
			effectiveConfig = resolveTurnNavConfig(config);
			emit();
		}
		/** Subscribe to effective config changes. */
		function subscribeTurnNavConfig(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		//#endregion
		//#region \0dsh-css:C:\Users\czx\Desktop\code\DSH\DeepSeek-Harness\packages\client\ui-turn-nav\src\client\TurnHistogramNav.module.css.mjs
		const css = "._7m5mq_host{display:contents}._7m5mq_rail{top:50%;right:var(--turn-nav-rail-right,8px);z-index:1000;flex-direction:column;align-items:flex-end;gap:0;padding:4px 2px;display:flex;position:fixed;transform:translateY(-50%)}._7m5mq_item{width:var(--turn-nav-item-width,28px);height:var(--turn-nav-item-height,14px);justify-content:flex-end;align-items:center;display:flex;position:relative}._7m5mq_lineButton{width:var(--turn-nav-item-width,28px);height:var(--turn-nav-item-height,14px);cursor:pointer;background:0 0;border:none;border-radius:999px;justify-content:flex-end;align-items:center;padding:0 2px;display:flex}._7m5mq_lineButton:hover{background:0 0}._7m5mq_lineButton:focus-visible{outline:none}._7m5mq_lineButton:focus-visible ._7m5mq_bar{background:var(--dsw-alias-state-business-primary);opacity:1}._7m5mq_bar{width:var(--turn-nav-bar-width,12px);background:var(--dsw-alias-label-tertiary);opacity:.55;will-change:width;height:4px;transition:width var(--turn-nav-wave-transition,.1s) ease-out, opacity var(--turn-nav-wave-transition,.1s) ease-out, background var(--turn-nav-wave-transition,.1s) ease-out;border-radius:999px}._7m5mq_item:hover ._7m5mq_bar,._7m5mq_item:focus-within ._7m5mq_bar{width:var(--turn-nav-focused-width,24px);background:var(--dsw-alias-state-business-primary);opacity:1}._7m5mq_item:has(+._7m5mq_item:hover) ._7m5mq_bar,._7m5mq_item:hover+._7m5mq_item ._7m5mq_bar{width:var(--turn-nav-adjacent-width,16px);opacity:.85}._7m5mq_item:has(+._7m5mq_item+._7m5mq_item:hover) ._7m5mq_bar,._7m5mq_item:hover+._7m5mq_item+._7m5mq_item ._7m5mq_bar{width:var(--turn-nav-neighbor-width,13px);opacity:.7}._7m5mq_preview{top:0;right:calc(100% + var(--turn-nav-preview-gap,10px));width:var(--turn-nav-preview-width,240px);max-height:var(--turn-nav-preview-max-height,132px);box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:var(--dsw-shadow-lv2);color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere;opacity:0;pointer-events:none;border-radius:10px;padding:8px 10px;font-size:12px;line-height:18px;transition:top .12s,opacity 80ms;position:absolute;overflow:hidden;transform:translateY(-50%)}._7m5mq_preview._7m5mq_visible{opacity:1}._7m5mq_previewIndex{color:var(--dsw-alias-label-caption);margin-bottom:2px;font-size:11px;font-weight:500;line-height:16px;display:block}@media (width<=767px){._7m5mq_rail[data-hide-narrow=true]{display:none}}";
		const tagId = "dsh-turn-nav/TurnHistogramNav.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-turn-nav";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TurnHistogramNav_module_css_default = {
			"bar": "_7m5mq_bar",
			"host": "_7m5mq_host",
			"item": "_7m5mq_item",
			"previewIndex": "_7m5mq_previewIndex",
			"rail": "_7m5mq_rail",
			"lineButton": "_7m5mq_lineButton",
			"preview": "_7m5mq_preview",
			"visible": "_7m5mq_visible"
		};
		//#endregion
		//#region src/client/TurnHistogramNav.tsx
		/** Extract a plain-text preview from a user/steering message node. */
		function previewOf(node) {
			if (node?.content === void 0) return "";
			return node.content.filter((block) => block.type === "text" && typeof block.text === "string").map((block) => block.text).join(" ").trim();
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
		function TurnHistogramNav({ useSession }) {
			const config = (0, react.useSyncExternalStore)(subscribeTurnNavConfig, getTurnNavConfig);
			const order = useSession((s) => s.chat.order);
			const nodeStore = useSession((s) => s.chat.nodes);
			const turns = (0, react.useMemo)(() => order.flatMap((key) => {
				const node = nodeStore.get(key);
				if (node?.kind !== "user" && node?.kind !== "steering") return [];
				return [{
					key,
					preview: previewOf(node.data)
				}];
			}), [order, nodeStore]);
			const [activeKey, setActiveKey] = (0, react.useState)(null);
			if (turns.length < config.minTurns) return null;
			const activeIndex = activeKey === null ? -1 : turns.findIndex((turn) => turn.key === activeKey);
			const showPreview = (key) => {
				setActiveKey(key);
			};
			const hidePreview = () => {
				const activeElement = document.activeElement;
				if (activeElement instanceof HTMLElement && activeElement.closest("[data-turn-nav-key]") !== null) return;
				setActiveKey(null);
			};
			const scrollToTurn = (key) => {
				const rows = document.querySelectorAll("[data-chat-anchor-key]");
				for (const row of rows) {
					if (row.dataset.chatAnchorKey !== key) continue;
					const scroller = row.closest("[data-conversation-scroll]");
					if (scroller !== null) {
						const top = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
						scroller.scrollTo({
							top: Math.max(0, top - config.scrollOffset),
							behavior: "smooth"
						});
					} else row.scrollIntoView({
						behavior: "smooth",
						block: "start"
					});
					return;
				}
			};
			const railPaddingTop = 4;
			const style = {
				"--turn-nav-bar-width": `${config.barWidth}px`,
				"--turn-nav-focused-width": `${config.focusedBarWidth}px`,
				"--turn-nav-adjacent-width": `${config.adjacentBarWidth}px`,
				"--turn-nav-neighbor-width": `${config.neighborBarWidth}px`,
				"--turn-nav-wave-transition": `${config.waveTransitionMs}ms`,
				"--turn-nav-preview-width": `${config.previewWidth}px`,
				"--turn-nav-preview-max-height": `${config.previewMaxHeight}px`,
				"--turn-nav-rail-right": `${config.railOffsetRight}px`,
				"--turn-nav-preview-gap": `${config.previewGap}px`,
				"--turn-nav-item-width": `${config.itemWidth}px`,
				"--turn-nav-item-height": `${config.itemHeight}px`
			};
			const previewTop = activeIndex >= 0 ? railPaddingTop + activeIndex * config.itemHeight + config.itemHeight / 2 : railPaddingTop + config.itemHeight / 2;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: TurnHistogramNav_module_css_default.host,
				style,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
					className: TurnHistogramNav_module_css_default.rail,
					"data-hide-narrow": config.hideOnNarrow ? "true" : "false",
					"aria-label": "对话轮次导航",
					onMouseLeave: hidePreview,
					onBlur: (event) => {
						if (!event.currentTarget.contains(event.relatedTarget)) hidePreview();
					},
					children: [turns.map((turn, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: TurnHistogramNav_module_css_default.item,
						"data-turn-nav-key": turn.key,
						onMouseEnter: () => {
							showPreview(turn.key);
						},
						onFocus: () => {
							showPreview(turn.key);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TurnHistogramNav_module_css_default.lineButton,
							"aria-label": `跳到第 ${index + 1} 轮`,
							onClick: () => {
								scrollToTurn(turn.key);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: TurnHistogramNav_module_css_default.bar })
						})
					}, turn.key)), config.previewEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: activeKey === null ? TurnHistogramNav_module_css_default.preview : `${TurnHistogramNav_module_css_default.preview} ${TurnHistogramNav_module_css_default.visible}`,
						role: "tooltip",
						"aria-hidden": activeKey === null,
						style: { top: previewTop },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: TurnHistogramNav_module_css_default.previewIndex,
							children: [
								"第 ",
								activeIndex + 1,
								" 轮"
							]
						}), activeIndex >= 0 ? turns[activeIndex]?.preview || "（无文本内容）" : ""]
					})]
				})
			});
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services: slots, the settings-namespace scope, and its transport dependencies. */
		const inject = [
			"slots",
			"settingsScope",
			"connection",
			"remote"
		];
		/**
		* Client plugin body.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const scope = ctx.settingsScope.bind({ namespace: TURN_NAV_NAMESPACE });
			const syncConfig = () => {
				const value = scope.getSnapshot().value;
				if (value !== void 0) setTurnNavConfig(value);
			};
			syncConfig();
			const unsubscribe = scope.subscribe(syncConfig);
			ctx.effect(() => unsubscribe, "dsh-turn-nav: settings scope");
			const service = {
				getConfig: () => getTurnNavConfig(),
				async updateConfig(patch) {
					for (const [field, value] of Object.entries(patch)) await scope.set(field, value);
				},
				async resetConfig() {
					for (const field of Object.keys(DEFAULT_TURN_NAV_CONFIG)) await scope.unset(field);
				}
			};
			ctx.reflect.provide("turnNav", service);
			if (typeof window !== "undefined") window.dshTurnNav = service;
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "ui-turn-nav"
			}, TurnHistogramNav));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
