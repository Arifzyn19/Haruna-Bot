import { phoneToJid } from '#helpers/identifier.js'

const cooldown = new Map()
const dailyCount = new Map()

function isOnCooldown(jid) {
  const last = cooldown.get(jid)
  if (!last) return false
  return Date.now() - last < 60_000
}

function countToday(jid) {
  const key = jid + ':' + new Date().toISOString().slice(0, 10)
  return dailyCount.get(key) ?? 0
}

function incCount(jid) {
  const key = jid + ':' + new Date().toISOString().slice(0, 10)
  dailyCount.set(key, (dailyCount.get(key) ?? 0) + 1)
  if (dailyCount.size > 1000) {
    const first = dailyCount.keys().next().value
    dailyCount.delete(first)
  }
}

export default {
  name: 'menfes',
  aliases: ['confess', 'menfess', 'confes'],
  category: 'general',
  description: 'Kirim pesan anonim — !menfes 628xxx <pesan>',
  cooldown: 3000,

  async execute(ctx) {
    if (!ctx.args[0] || !ctx.args[1]) {
      return ctx.reply(
        'Usage: `!menfes 628xxx <pesan>`\n' +
        'Contoh: `!menfes 628123456789 Halo, aku suka kamu...`\n' +
        'Pesan akan diforward anonim tanpa nama kamu.'
      )
    }

    if (isOnCooldown(ctx.sender)) return ctx.reply('Tunggu 60 detik sebelum menfes lagi.')

    if (countToday(ctx.sender) >= 3) return ctx.reply('Maks 3 menfes per hari. Coba lagi besok.')

    const rawTarget = ctx.args[0].replace(/[^0-9]/g, '')
    if (rawTarget.length < 8 || rawTarget.length > 15) return ctx.reply('Nomor target tidak valid. Contoh: `628123456789`')

    const targetJid = phoneToJid(rawTarget)
    const msg = ctx.args.slice(1).join(' ').trim()
    if (!msg || msg.length > 1000) return ctx.reply('Pesan 1-1000 karakter.')
    if (targetJid === ctx.sender) return ctx.reply('Gak bisa menfes ke diri sendiri.')

    try {
      await ctx.sendTo(targetJid, `💌 *Menfes Anonymous*\n\n${msg}\n\n— _Pesan ini dikirim anonim via HarunaBot. Ketik *!menfes* untuk balas._`)
      cooldown.set(ctx.sender, Date.now())
      incCount(ctx.sender)
      await ctx.reply(`✅ Menfes terkirim ke @${rawTarget} (anonim).`, { mentions: [targetJid] })
    } catch (err) {
      await ctx.reply(`Gagal kirim: ${err.message}`)
    }
  },
}
