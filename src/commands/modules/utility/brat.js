import { createCanvas } from '@napi-rs/canvas'
import { toStickerBuffer } from '#features/media/sticker.js'

export default {
  name: 'brat',
  aliases: ['bratsticker'],
  category: 'utility',
  description: 'Brat sticker lime green — !brat <teks>',
  cooldown: 5000,

  async execute(ctx) {
    const text = ctx.rawArgs?.trim()
    if (!text) return ctx.reply('Usage: `!brat <teks>`\nContoh: `!brat halo haruna`')
    if (text.length > 100) return ctx.reply('Maks 100 karakter.')

    const W = 512, H = 512
    const canvas = createCanvas(W, H)
    const c = canvas.getContext('2d')

    c.fillStyle = '#8ACE00'
    c.fillRect(0, 0, W, H)

    // Grain texture
    c.fillStyle = 'rgba(0,0,0,0.04)'
    for (let i = 0; i < 800; i++) {
      c.fillRect(Math.random() * W, Math.random() * H, 1, 1)
    }

    c.fillStyle = '#000'
    c.filter = 'blur(0.6px)'
    c.textAlign = 'center'
    c.textBaseline = 'middle'

    const words = text.split(/\s+/)
    let fontSize = 58
    let lines = []

    // Auto-fit: try smaller font until fits
    for (let s = 58; s >= 22; s -= 2) {
      c.font = `400 ${s}px Arial Narrow, Arial, sans-serif`
      const testLines = []
      let cur = ''
      for (const w of words) {
        const trial = cur ? cur + ' ' + w : w
        if (c.measureText(trial).width > W - 40) {
          if (cur) testLines.push(cur)
          cur = w
        } else cur = trial
      }
      if (cur) testLines.push(cur)
      const h = testLines.length * s * 1.15
      if (h < H - 60) { fontSize = s; lines = testLines; break }
    }

    if (!lines.length) {
      lines = [text.slice(0, 20)]
      fontSize = 22
      c.font = `400 ${fontSize}px Arial Narrow, Arial, sans-serif`
    } else {
      c.font = `400 ${fontSize}px Arial Narrow, Arial, sans-serif`
    }

    const lineH = fontSize * 1.15
    const totalH = lines.length * lineH
    let y = (H - totalH) / 2 + lineH / 2 - 4

    for (const line of lines) {
      c.fillText(line, W / 2, y)
      y += lineH
    }

    const png = await canvas.encode('png')
    const sticker = await toStickerBuffer(Buffer.from(png), {
      packName: 'Brat',
      packPublish: 'HarunaBot',
      emojis: ['💚'],
    })

    await ctx.send({ sticker, mimetype: 'image/webp' })
  },
}
