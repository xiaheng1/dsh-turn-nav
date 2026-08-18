/**
 * Record a turn-nav demo GIF.
 *
 * Sequence:
 *   1. Mouse starts near the bottom edge, outside the rail.
 *   2. Sweeps upward across the rail to the top edge (no visible fake cursor).
 *   3. Moves to one chosen turn item and holds there for 1s, showing the
 *      wave + preview.
 *   4. Clicks that item and records the conversation jumping to the turn.
 *
 * Prerequisite:
 *   & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir=C:\dsh-turn-nav-edge
 *
 * Then open http://127.0.0.1:3080/ in that Edge, enter a conversation with
 * several user turns, and run:
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
const HOVER_PAUSE_MS = Number(process.env.DSH_HOVER_PAUSE_MS ?? 1000)
const JUMP_MS = Number(process.env.DSH_JUMP_MS ?? 1800)

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

const first = boxes[0]
const last = boxes.at(-1)
const x = first.x + first.width / 2

// Use viewport edges so the sweep visually enters from the bottom and exits
// at the top. Screenshots are full-viewport, so the whole page stays visible
// and the final click/jump reads clearly.
const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))
const yBottom = viewport.height - 2
const yTop = 2

const targetIndex = Math.floor(boxes.length / 2)
const target = boxes[targetIndex]
const targetX = target.x + target.width / 2
const targetY = target.y + target.height / 2

let frame = 0
const save = async () => {
  await page.screenshot({ path: `${OUT_DIR}/${String(frame).padStart(4, '0')}.png` })
  frame += 1
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// 1) Start near the bottom edge.
await page.mouse.move(x, yBottom)
await page.waitForTimeout(200)
await save()

// 2) One bottom-to-top sweep across the rail.
for (let i = 0; i <= STEPS; i += 1) {
  const t = i / STEPS
  await page.mouse.move(x, yBottom + (yTop - yBottom) * ease(t))
  await page.waitForTimeout(HOLD_MS)
  await save()
}

// 3) Move to the chosen turn item and hold, showing wave + preview.
await page.mouse.move(targetX, targetY)
const paused = Math.max(1, Math.round(HOVER_PAUSE_MS / HOLD_MS))
for (let i = 0; i < paused; i += 1) {
  await page.waitForTimeout(HOLD_MS)
  await save()
}

// 4) Click the item and record the jump.
await page.mouse.click(targetX, targetY)
const jumpFrames = Math.max(1, Math.round(JUMP_MS / HOLD_MS))
for (let i = 0; i < jumpFrames; i += 1) {
  await page.waitForTimeout(HOLD_MS)
  await save()
}

console.log(`Captured ${frame} frames in ${OUT_DIR}/`)
console.log('Now run: npm run make:gif')
await browser.close()
