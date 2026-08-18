window.__ModuleLoader__.load({
	id: "dsh-turn-nav",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:C:\Users\czx\Desktop\code\DSH\DeepSeek-Harness\packages\client\ui-turn-nav\src\client\TurnHistogramNav.module.css.mjs
		const css = "._7m5mq_host{display:contents}._7m5mq_rail{z-index:1000;flex-direction:column;align-items:flex-end;gap:0;padding:4px 2px;display:flex;position:fixed;top:50%;right:8px;transform:translateY(-50%)}._7m5mq_item{justify-content:flex-end;align-items:center;width:28px;height:14px;display:flex;position:relative}._7m5mq_lineButton{cursor:pointer;background:0 0;border:none;border-radius:999px;justify-content:flex-end;align-items:center;width:28px;height:14px;padding:0 2px;display:flex}._7m5mq_lineButton:hover{background:0 0}._7m5mq_lineButton:focus-visible{outline:none}._7m5mq_lineButton:focus-visible ._7m5mq_bar{background:var(--dsw-alias-state-business-primary);opacity:1}._7m5mq_bar{background:var(--dsw-alias-label-tertiary);opacity:.55;border-radius:999px;width:12px;height:4px;transition:width 70ms,opacity 70ms,background 70ms}._7m5mq_item:hover ._7m5mq_bar,._7m5mq_item:focus-within ._7m5mq_bar{background:var(--dsw-alias-state-business-primary);opacity:1;width:26px}._7m5mq_item:has(+._7m5mq_item:hover) ._7m5mq_bar,._7m5mq_item:hover+._7m5mq_item ._7m5mq_bar{opacity:.85;width:17px}._7m5mq_item:has(+._7m5mq_item+._7m5mq_item:hover) ._7m5mq_bar,._7m5mq_item:hover+._7m5mq_item+._7m5mq_item ._7m5mq_bar{opacity:.7;width:13px}._7m5mq_preview{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:240px;max-height:132px;box-shadow:var(--dsw-shadow-lv2);color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere;opacity:0;pointer-events:none;border-radius:10px;padding:8px 10px;font-size:12px;line-height:18px;transition:top .12s,opacity 80ms;position:absolute;top:0;right:calc(100% + 10px);overflow:hidden;transform:translateY(-50%)}._7m5mq_preview._7m5mq_visible{opacity:1}._7m5mq_previewIndex{color:var(--dsw-alias-label-caption);margin-bottom:2px;font-size:11px;font-weight:500;line-height:16px;display:block}@media (width<=767px){._7m5mq_rail{display:none}}";
		const tagId = "dsh-turn-nav/TurnHistogramNav.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-turn-nav";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TurnHistogramNav_module_css_default = {
			"rail": "_7m5mq_rail",
			"item": "_7m5mq_item",
			"lineButton": "_7m5mq_lineButton",
			"bar": "_7m5mq_bar",
			"preview": "_7m5mq_preview",
			"visible": "_7m5mq_visible",
			"host": "_7m5mq_host",
			"previewIndex": "_7m5mq_previewIndex"
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
			if (turns.length < 1) return null;
			const [activeKey, setActiveKey] = (0, react.useState)(null);
			const activeIndex = activeKey === null ? -1 : turns.findIndex((turn) => turn.key === activeKey);
			const showPreview = (key) => {
				setActiveKey(key);
			};
			const hidePreview = () => {
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
							top: Math.max(0, top - 16),
							behavior: "smooth"
						});
					} else row.scrollIntoView({
						behavior: "smooth",
						block: "start"
					});
					return;
				}
			};
			const previewTop = activeIndex >= 0 ? 11 + activeIndex * 14 : 11;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: TurnHistogramNav_module_css_default.host,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
					className: TurnHistogramNav_module_css_default.rail,
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
					}, turn.key)), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
		/** Required services: the slot registry. */
		const inject = ["slots"];
		/**
		* Client plugin body.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
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
