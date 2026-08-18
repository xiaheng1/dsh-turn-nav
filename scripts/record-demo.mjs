/**
 * Record a smooth mouse sweep across the turn-nav rail.
 *
 * Prerequisite: start Edge with a debugging port, open DSH Web, and open a
 * conversation that has at least one user turn:
 *
 *   & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir=C:\dsh-turn-nav-edge
 *
 * Then run:
 *
 *   npm install
 *   npm run record:demo
 *   npm run make:gif
 */
import { mkdirSync, rmSync } from 'node:fs'
import { chromium } from 'playwright'

const CDP_URL = process.env.DSH_CDP_URL ?? 'http://127.0.0.1:9222'
const OUT_DIR = process.env.DSH_FRAMES ?? 'demo-frames'
const STEPS = Number(process.env.DSH_STEPS ?? 80)
const HOLD_MS = Number(process.env.DSH_HOLD_MS ?? 30)
const BACK_AND_FORTH = process.env.DSH_BACK_AND_FORTH !== '0'

const browser = await chromium.connectOverCDP(CDP_URL)
const context = browser.contexts()[0]
const page = context.pages().find(p => p.url().includes('3080')) ?? context.pages()[0]
if (page === undefined) {
  console.error('No open page found. Open http://127.0.0.1:3080/ in the debugging Edge first.')
  process.exit(1)
}
await page.bringToFront()
await page.waitForSelector('[data-turn-nav-key]', { timeout: 10_000 })
await page.waitForTimeout(300)

const items = await page.locator('[data-turn-nav-key]').all()
if (items.length < 2) {
  console.error(`Only ${items.length} turn-nav item(s) found; open a conversation with several user turns.`)
  process.exit(1)
}

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

const boxes = []
for (const item of items) boxes.push(await item.boundingBox())

// The rail is vertical: sweep top -> bottom at the rail's center x.
const first = boxes[0]
const last = boxes.at(-1)
const x = first.x + first.width / 2
const y0 = first.y + first.height / 2
const y1 = last.y + last.height / 2

// Inject a visible fake cursor. Playwright screenshots do not include the OS
// cursor, so this element stands in for it.
await page.evaluate(() => {
  if (document.getElementById('__dsh_rec_cursor') !== null) return
  const cursor = document.createElement('div')
  cursor.id = '__dsh_rec_cursor'
  cursor.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    'width:18px',
    'height:18px',
    'border-radius:50%',
    'background:#0a84ff',
    'border:2px solid #ffffff',
    'box-shadow:0 0 0 1px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.35)',
    'z-index:2147483647',
    'pointer-events:none',
    'margin-left:-9px',
    'margin-top:-9px',
  ].join(';')
  document.body.appendChild(cursor)
})

const moveCursor = async (cx, cy) => {
  await page.mouse.move(cx, cy)
  await page.evaluate(([px, py]) => {
    const el = document.getElementById('__dsh_rec_cursor')
    if (el !== null) el.style.transform = `translate(${px}px, ${py}px)`
  }, [cx, cy])
}

// Crop to the rail + preview card region only, so the GIF stays compact.
const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))
const previewWidth = 280
const clipWidth = Math.min(viewport.width, Math.round(x + previewWidth))
const margin = 24
const clipTop = Math.max(0, Math.round(first.y - margin))
const clipBottom = Math.min(viewport.height, Math.round(last.y + last.height + margin))
const clip = {
  x: Math.max(0, Math.round(x - previewWidth)),
  y: clipTop,
  width: clipWidth - Math.max(0, Math.round(x - previewWidth)),
  height: clipBottom - clipTop,
}

let frame = 0
const save = async () => {
  await page.screenshot({ path: `${OUT_DIR}/${String(frame).padStart(4, '0')}.png`, clip })
  frame += 1
}

// Initial state: no hover.
await moveCursor(x - 200, y0)
await page.waitForTimeout(300)
await save()

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Smooth vertical sweep.
for (let i = 0; i <= STEPS; i += 1) {
  const t = i / STEPS
  await moveCursor(x, y0 + (y1 - y0) * ease(t))
  await page.waitForTimeout(HOLD_MS)
  await save()
}

// Optional reverse sweep so the GIF loops better.
if (BACK_AND_FORTH) {
  for (let i = STEPS; i >= 0; i -= 1) {
    const t = i / STEPS
    await moveCursor(x, y0 + (y1 - y0) * ease(t))
    await page.waitForTimeout(HOLD_MS)
    await save()
  }
}

console.log(`Captured ${frame} frames in ${OUT_DIR}/`)
console.log('Now run: npm run make:gif')
await browser.close()
