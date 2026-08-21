import { createCanvas } from '@napi-rs/canvas'
import sharp from 'sharp'
import { toStickerBuffer } from '#features/media/sticker.js'

async function generateBratImage(text, options = {}) {
  const {
    bgColor = '#8ACE00',
    textColor = '#000000',
    size = 512,
    blur = 3,
  } = options

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  const cleanText = text.toLowerCase().trim()
  const padding = size * 0.08
  const maxWidth = size - padding * 2
  const maxHeight = size - padding * 2

  ctx.fillStyle = textColor
  ctx.textBaseline = 'alphabetic'

  let fontSize = size * 0.22
  let lines = []
  const fontFamily = '"Arial Narrow", "Helvetica Neue", Arial, sans-serif'

  while (fontSize > 8) {
    ctx.font = `${fontSize}px ${fontFamily}`
    lines = wrapText(ctx, cleanText, maxWidth)
    const lineHeight = fontSize * 1.05
    const totalHeight = lines.length * lineHeight
    const widestLine = Math.max(...lines.map((l) => ctx.measureText(l).width))
    if (totalHeight <= maxHeight && widestLine <= maxWidth) break
    fontSize -= 2
  }

  const lineHeight = fontSize * 1.05
  const totalHeight = lines.length * lineHeight
  let startY = (size - totalHeight) / 2 + fontSize * 0.85

  ctx.font = `${fontSize}px ${fontFamily}`
  lines.forEach((line, i) => {
    ctx.fillText(line, padding, startY + i * lineHeight)
  })

  const pngBuffer = canvas.toBuffer('image/png')
  const blurredBuffer = await sharp(pngBuffer).blur(blur).png().toBuffer()
  return blurredBuffer
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/)
  const lines = []
  let currentLine = ''
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = ctx.measureText(testLine).width
    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export default {
  name: 'brat',
  aliases: ['bratsticker'],
  category: 'utility',
  description: 'Brat sticker — !brat <teks>',
  cooldown: 5000,

  async execute(ctx) {
    const text = ctx.rawArgs?.trim()
    if (!text) return ctx.reply('Usage: `!brat <teks>`\nContoh: `!brat halo haruna`')
    if (text.length > 100) return ctx.reply('Maks 100 karakter.')

    await ctx.react('⏳').catch(() => {})
    try {
      const png = await generateBratImage(text, { bgColor: '#8ACE00', textColor: '#000000', size: 512, blur: 3 })
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
