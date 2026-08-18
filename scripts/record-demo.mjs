/**
 * Record a smooth mouse sweep across the turn-nav rail.
 *
 * Prerequisite: start Edge with a debugging port, open DSH Web, and open a
 * conversation that has at least one user turn:
 *
 *   msedge.exe --remote-debugging-port=9222 --user-data-dir=C:\dsh-turn-nav-edge
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
const STEPS = Number(process.env.DSH_STEPS ?? 70)
const HOLD_MS = Number(process.env.DSH_HOLD_MS ?? 24)
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
const start = boxes[0]
const end = boxes.at(-1)
const y = (start.y + start.height / 2 + end.y + end.height / 2) / 2
const x0 = start.x + start.width / 2
const x1 = end.x + end.width / 2

let frame = 0
const save = async () => {
  await page.screenshot({ path: `${OUT_DIR}/${String(frame).padStart(4, '0')}.png` })
  frame += 1
}

// Initial state: no hover.
await page.mouse.move(x0 - 200, y)
await page.waitForTimeout(200)
await save()

// Smooth forward sweep.
for (let i = 0; i <= STEPS; i += 1) {
  const t = i / STEPS
  // ease-in-out so the movement starts and ends gently
  const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  await page.mouse.move(x0 + (x1 - x0) * ease, y)
  await page.waitForTimeout(HOLD_MS)
  await save()
}

// Optional reverse sweep so the GIF loops better.
if (BACK_AND_FORTH) {
  for (let i = STEPS; i >= 0; i -= 1) {
    const t = i / STEPS
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    await page.mouse.move(x0 + (x1 - x0) * ease, y)
    await page.waitForTimeout(HOLD_MS)
    await save()
  }
}

console.log(`Captured ${frame} frames in ${OUT_DIR}/`)
console.log('Now run: npm run make:gif')
await browser.close()
