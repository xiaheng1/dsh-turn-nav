import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

// Reuse the esbuild installed in the DeepSeek-Harness workspace so this
// independent plugin package does not need its own build-tool dependency.
const esbuildRoot = 'C:\\Users\\czx\\Desktop\\code\\DSH\\DeepSeek-Harness\\node_modules\\.pnpm\\esbuild@0.28.1\\node_modules\\esbuild'
const require = createRequire(path.join(esbuildRoot, 'package.json'))
const { build } = require(esbuildRoot)

const cssTagId = 'dsh-turn-nav/TurnHistogramNav.module.css'

async function buildClient() {
  const result = await build({
    entryPoints: ['src/client/index.ts'],
    bundle: true,
    format: 'iife',
    globalName: '__dshTurnNavBundle',
    platform: 'browser',
    jsx: 'automatic',
    external: ['react', 'react/jsx-runtime'],
    loader: { '.css': 'local-css' },
    write: false,
    outfile: 'lib/client.js',
    minify: true,
  })

  const jsFile = result.outputFiles.find((f) => f.path.endsWith('.js'))
  const cssFile = result.outputFiles.find((f) => f.path.endsWith('.css'))
  if (!jsFile || !cssFile) {
    throw new Error('esbuild did not produce expected JS/CSS outputs')
  }

  const cssString = cssFile.text
  const injectedCss = `
const css = ${JSON.stringify(cssString)};
const tagId = ${JSON.stringify(cssTagId)};
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-turn-nav";
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
`

  // esbuild `globalName` emits `var <NAME> = (() => { ... return __toCommonJS(...) })();`.
  // Capture the actual (possibly minified) variable name so the factory can
  // copy the entry exports onto module.exports.
  const iifeBody = jsFile.text
  const match = iifeBody.match(/^var (\w+)\s*=\s*\(\(\)\s*=>/)
  if (!match) {
    throw new Error('esbuild globalName output shape not recognized')
  }
  const bundleVar = match[1]

  const wrapped = `window.__ModuleLoader__.load({
  id: "dsh-turn-nav",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${injectedCss.replace(/^/gm, '    ').trimEnd()}
${iifeBody.replace(/^/gm, '    ').trimEnd()}
    Object.assign(module.exports, ${bundleVar});
    return module.exports;
  }
});
`

  fs.mkdirSync('lib', { recursive: true })
  fs.writeFileSync(path.join('lib', 'client.js'), wrapped, 'utf8')
  console.log('lib/client.js written')

  smokeClient(wrapped)
}

/**
 * Run the generated client bundle through a simulated DSH ModuleLoader to
 * catch regressions early: (1) the factory must expose `apply`/`inject` on
 * module.exports, (2) apply() must register the slot without throwing, and
 * (3) rendering the component must not reference an undefined React global.
 */
function smokeClient(bundleCode) {
  const vm = require('node:vm')
  const react = {
    useSyncExternalStore: (sub, get) => get(),
    useState: (init) => [init, () => {}],
    useMemo: (fn) => fn(),
    createElement: () => null,
    Children: {},
  }
  const jsxRuntime = { jsx: () => null, jsxs: () => null, Fragment: Symbol('Fragment') }
  const scope = {
    getSnapshot: () => ({ value: undefined }),
    subscribe: () => () => {},
    set: async () => {},
    unset: async () => {},
  }
  let registered = null
  const ctx = {
    settingsScope: { bind: () => scope },
    effect: () => {},
    reflect: { provide: () => {} },
    slots: {
      inject: (_name, register) => { registered = register() },
      register: (def) => () => def,
    },
  }
  const sandbox = {
    window: {},
    document: {
      head: { appendChild() {} },
      querySelector: () => null,
      createElement: () => ({ dataset: {}, set textContent(v) {} }),
    },
  }
  sandbox.window.__ModuleLoader__ = {
    load(def) {
      const require = (id) => {
        if (id === 'react') return react
        if (id === 'react/jsx-runtime') return jsxRuntime
        throw new Error('cannot require ' + id)
      }
      const m = def.factory(require)
      if (typeof m.apply !== 'function') throw new Error('factory did not expose apply')
      if (!Array.isArray(m.inject)) throw new Error('factory did not expose inject')
      m.apply(ctx)
      if (typeof registered !== 'function') throw new Error('slot component was not registered')
      try {
        registered({ useSession: (sel) => sel({ chat: { order: [], nodes: new Map() } }) })
      } catch (error) {
        throw new Error('component render failed: ' + error.message)
      }
    },
  }
  vm.createContext(sandbox)
  vm.runInContext(bundleCode, sandbox)
  console.log('lib/client.js smoke test: PASS (apply/inject/slot/render)')
}

async function buildNode() {
  await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: 'lib/index.js',
    external: [
      '@deepseek-ai/schemastery',
      '@deepseek-ai/dsh-settings',
      'node:fs',
      'node:url',
    ],
    minify: true,
  })
  console.log('lib/index.js written')
}

await buildClient()
await buildNode()
