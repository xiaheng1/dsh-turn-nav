/**
 * Record a turn-nav demo GIF.
 *
 * Sequence:
 *   1. Start with a close-up of the rail, then zoom out to the full page.
 *   2. Mouse sweeps once from the bottom edge to the top edge across the rail.
 *      No fake cursor is injected.
 *   3. Move to one chosen turn item and hold there, showing wave + preview.
 *   4. Click that item and record the conversation jumping to the turn.
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
const STEPS = Number(process.env.DSH_STEPS ?? 140)          // sweep frames; higher = slower
const HOLD_MS = Number(process.env.DSH_HOLD_MS ?? 50)       // ms per captured frame
const HOVER_PAUSE_MS = Number(process.env.DSH_HOVER_PAUSE_MS ?? 1500)
const JUMP_MS = Number(process.env.DSH_JUMP_MS ?? 2000)
const ZOOM_HOLD_MS = Number(process.env.DSH_ZOOM_HOLD_MS ?? 800)
const ZOOM_STEPS = Number(process.env.DSH_ZOOM_STEPS ?? 30)

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
const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))

// Wide shot = the conversation column, not the whole browser window.
const conv = await page.locator('[data-conversation-scroll]').evaluateAll(els => {
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width > 200 && r.height > 200) {
      return { x: r.x, y: r.y, width: r.width, height: r.height }
    }
  }
  return { x: 0, y: 0, width: innerWidth, height: innerHeight }
})
const convClip = {
  x: Math.round(conv.x),
  y: Math.round(conv.y),
  width: Math.round(conv.width),
  height: Math.round(conv.height),
}

const yBottom = convClip.y + convClip.height - 2
const yTop = convClip.y + 2
const targetIndex = Math.floor(boxes.length / 2)
const target = boxes[targetIndex]
const targetX = target.x + target.width / 2
const targetY = target.y + target.height / 2

// Close-up clip with the SAME aspect ratio as the wide shot, so every frame
// can be resized to one GIF canvas without distortion.
const aspect = convClip.width / convClip.height
const closeHeight = Math.min(convClip.height, 420)
const closeWidth = Math.round(closeHeight * aspect)
const railCenterX = x
const railCenterY = (first.y + first.height / 2 + last.y + last.height / 2) / 2
const closeRight = Math.min(viewport.width, Math.round(railCenterX + closeWidth / 2))
const closeLeft = closeRight - closeWidth
const closeTop = Math.min(
  Math.max(0, Math.round(railCenterY - closeHeight / 2)),
  viewport.height - closeHeight,
)
const railClip = {
  x: Math.max(0, closeLeft),
  y: Math.max(0, closeTop),
  width: closeWidth,
  height: closeHeight,
}
const fullClip = convClip

const mixClip = (a, b, t) => ({
  x: Math.round(a.x + (b.x - a.x) * t),
  y: Math.round(a.y + (b.y - a.y) * t),
  width: Math.round(a.width + (b.width - a.width) * t),
  height: Math.round(a.height + (b.height - a.height) * t),
})

let frame = 0
const save = async (clip) => {
  await page.screenshot({ path: `${OUT_DIR}/${String(frame).padStart(4, '0')}.png`, clip })
  frame += 1
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// 1) Brief close-up on the rail before the sweep.
for (let i = 0; i < Math.max(1, Math.round(ZOOM_HOLD_MS / HOLD_MS)); i += 1) {
  await page.waitForTimeout(HOLD_MS)
  await save(railClip)
}

// 2) One bottom-to-top sweep across the rail, captured in close-up.
const closeYBottom = railClip.y + railClip.height - 2
const closeYTop = railClip.y + 2
await page.mouse.move(x, closeYBottom)
await page.waitForTimeout(200)
await save(railClip)
for (let i = 0; i <= STEPS; i += 1) {
  const t = i / STEPS
  await page.mouse.move(x, closeYBottom + (closeYTop - closeYBottom) * ease(t))
  await page.waitForTimeout(HOLD_MS)
  await save(railClip)
}

// 3) Move to the chosen turn item and hold, still in close-up.
await page.mouse.move(targetX, targetY)
for (let i = 0; i < Math.max(1, Math.round(HOVER_PAUSE_MS / HOLD_MS)); i += 1) {
  await page.waitForTimeout(HOLD_MS)
  await save(railClip)
}

// 4) Zoom out to the conversation-wide shot while hovering the target.
for (let i = 0; i <= ZOOM_STEPS; i += 1) {
  await page.waitForTimeout(HOLD_MS)
  await save(mixClip(railClip, fullClip, i / ZOOM_STEPS))
}

// 5) Click and record the jump.
await page.mouse.click(targetX, targetY)
for (let i = 0; i < Math.max(1, Math.round(JUMP_MS / HOLD_MS)); i += 1) {
  await page.waitForTimeout(HOLD_MS)
  await save(fullClip)
}

console.log(`Captured ${frame} frames in ${OUT_DIR}/`)
console.log('Now run: npm run make:gif')
await browser.close()
