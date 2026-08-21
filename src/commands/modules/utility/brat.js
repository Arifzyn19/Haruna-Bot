import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs'
import path from 'path'
import os from 'os'
import { toStickerBuffer } from '#features/media/sticker.js'

const FONT_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Font/ARIALN.ttf'
const EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json'

let assetsReady = false
let fontPath = ''
let emojiJsonPath = ''

const THEMES = {
  black: { bg: '#000000', text: '#ffffff' },
  white: { bg: '#ffffff', text: '#000000' },
  green: { bg: '#8ace00', text: '#000000' },
}

async function download(url, dest) {
  if (existsSync(dest)) return
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed download: ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buffer)
}

async function prepareAssets() {
  if (assetsReady) return
  const dir = path.join(os.tmpdir(), 'brat-generator-assets')
  mkdirSync(dir, { recursive: true })
  fontPath = path.join(dir, 'ARIALN.ttf')
  emojiJsonPath = path.join(dir, 'emoji-apple.json')
  await download(FONT_URL, fontPath)
  await download(EMOJI_JSON_URL, emojiJsonPath)
  try { GlobalFonts.registerFromPath(fontPath, 'ArialNarrow') } catch {}
  assetsReady = true
}

let emojiMap = null
const emojiImageCache = new Map()

function emojiToUnicode(emoji) {
  return [...emoji].map((c) => c.codePointAt(0).toString(16).padStart(4, '0')).join('-')
}

async function loadEmojiMap() {
  if (emojiMap) return emojiMap
  await prepareAssets()
  emojiMap = JSON.parse(readFileSync(emojiJsonPath, 'utf-8'))
  return emojiMap
}

async function getEmojiImage(emoji) {
  if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji)
  const map = await loadEmojiMap()
  const base = emojiToUnicode(emoji)
  const cleanBase = base.replace(/-fe0f/gi, '')
  const variants = [base, cleanBase, `${cleanBase}-fe0f`, base.toUpperCase(), cleanBase.toUpperCase(), `${cleanBase.toUpperCase()}-FE0F`]
  let b64 = null
  for (const v of variants) if (map[v]) { b64 = map[v]; break }
  if (!b64) return null
  const img = await loadImage(Buffer.from(b64, 'base64'))
  emojiImageCache.set(emoji, img)
  return img
}

const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)/gu

function measureTextCustom(ctx, text, fontSize) {
  const parts = text.split(EMOJI_REGEX)
  let w = 0
  for (const part of parts) {
    if (!part) continue
    EMOJI_REGEX.lastIndex = 0
    if (EMOJI_REGEX.test(part)) w += fontSize
    else w += ctx.measureText(part).width
    EMOJI_REGEX.lastIndex = 0
  }
  return w
}

async function drawTextWithEmojis(ctx, text, x, y, fontSize) {
  const parts = text.split(EMOJI_REGEX)
  let curX = x
  for (const part of parts) {
    if (!part) continue
    EMOJI_REGEX.lastIndex = 0
    if (EMOJI_REGEX.test(part)) {
      const img = await getEmojiImage(part)
      if (img) { ctx.drawImage(img, curX, y, fontSize, fontSize); curX += fontSize }
      else { ctx.fillText(part, curX, y); curX += ctx.measureText(part).width }
    } else {
      ctx.fillText(part, curX, y)
      curX += ctx.measureText(part).width
    }
    EMOJI_REGEX.lastIndex = 0
  }
}

function wrapText(ctx, text, maxWidth, fontSize) {
  ctx.font = `${fontSize}px ArialNarrow`
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word
    if (measureTextCustom(ctx, test, fontSize) > maxWidth && cur) { lines.push(cur); cur = word }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

function fitsAt(ctx, text, fontSize, maxWidth, maxHeight, lineGap) {
  const lines = wrapText(ctx, text, maxWidth, fontSize)
  const words = text.split(' ').filter(Boolean)
  const longest = Math.max(...words.map((w) => measureTextCustom(ctx, w, fontSize)), 0)
  const totalH = lines.length * (fontSize + lineGap) - lineGap
  return longest <= maxWidth && totalH <= maxHeight
}

function findBestFontSize(ctx, text, maxWidth, maxHeight, lineGap) {
  let lo = 10, hi = 700, best = lo
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (fitsAt(ctx, text, mid, maxWidth, maxHeight, lineGap)) { best = mid; lo = mid + 1 }
    else hi = mid - 1
  }
  return best
}

async function generateBratBuffer({ text = 'Halo', theme = 'green', blur = 0 } = {}) {
  const selectedTheme = THEMES[theme] || THEMES.green
  const blurAmount = [0, 1, 2, 3].includes(Number(blur)) ? Number(blur) : 0
  const size = 1000
  const padding = 80
  const lineGap = 20
  const maxWidth = size - padding * 2
  const maxHeight = size - padding * 2

  await prepareAssets()
  await loadEmojiMap()

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const fontSize = findBestFontSize(ctx, text, maxWidth, maxHeight, lineGap)
  const lines = wrapText(ctx, text, maxWidth, fontSize)

  ctx.fillStyle = selectedTheme.bg
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = selectedTheme.text
  ctx.font = `${fontSize}px ArialNarrow`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.save()
  if (blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`
  const totalH = lines.length * (fontSize + lineGap) - lineGap
  let y = (size - totalH) / 2
  for (const line of lines) {
    await drawTextWithEmojis(ctx, line, padding, y, fontSize)
    y += fontSize + lineGap
  }
  ctx.restore()
  return await canvas.encode('png')
}

export default {
  name: 'brat',
  aliases: ['bratsticker'],
  category: 'utility',
  description: 'Brat sticker — !brat <teks> | !brat white <teks>',
  cooldown: 5000,

  async execute(ctx) {
    let text = ctx.rawArgs?.trim()
    if (!text) return ctx.reply('Usage: `!brat <teks>`\nContoh: `!brat halo` atau `!brat white halo`')

    let theme = 'green'
    let blur = 0
    const lower = text.toLowerCase()
    if (lower.startsWith('white ')) { theme = 'white'; text = text.slice(6).trim() }
    else if (lower.startsWith('black ')) { theme = 'black'; text = text.slice(6).trim() }
    else if (lower.startsWith('green ')) { theme = 'green'; text = text.slice(6).trim() }

    if (!text) return ctx.reply('Teks tidak boleh kosong.')
    if (text.length > 200) return ctx.reply('Maks 200 karakter.')

    await ctx.react('⏳').catch(() => {})
    try {
      const png = await generateBratBuffer({ text, theme, blur })
      const sticker = await toStickerBuffer(Buffer.from(png), {
        packName: 'Brat',
        packPublish: 'HarunaBot',
        emojis: ['💚'],
      })
      await ctx.send({ sticker, mimetype: 'image/webp' })
      await ctx.react('✅').catch(() => {})
    } catch (err) {
      await ctx.reply(`Gagal bikin brat: ${err.message}`)
      await ctx.react('❌').catch(() => {})
    }
  },
}
