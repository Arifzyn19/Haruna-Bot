import { reminderModel } from '#storage/models/index.js'
import { parseDuration, formatDuration } from '#helpers/duration.js'

export default {
  name: 'jadwal',
  aliases: ['schedule', 'jadwalkan'],
  category: 'group',
  description: 'Jadwal pesan grup: !jadwal 10m <pesan>',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5000,
  async execute(ctx) {
    if (ctx.args[0]?.toLowerCase() === 'list') {
      const list = reminderModel.listByJid(ctx.jid)
      if (!list.length) return ctx.reply('Tidak ada jadwal di grup ini.')
      const lines = list.map(r => `#${r.id} — ${r.text.slice(0, 40)} (⏰ ${new Date(r.trigger_at * 1000).toLocaleString('id-ID')})`)
      return ctx.reply(`*Jadwal grup:*\n${lines.join('\n')}`)
    }
    if (['hapus', 'del', 'delete'].includes(ctx.args[0]?.toLowerCase())) {
      const id = parseInt(ctx.args[1])
      if (!id) return ctx.reply('Usage: `!jadwal hapus <id>`')
      reminderModel.delete(id)
      return ctx.reply(`Jadwal #${id} dihapus.`)
    }
    if (!ctx.args[0] || !ctx.args[1]) return ctx.reply('Usage: `!jadwal 10m <pesan>` | `!jadwal list`')
    if (reminderModel.countByJid(ctx.jid) >= 10) return ctx.reply('Maks 10 jadwal per grup.')
    const ms = parseDuration(ctx.args[0])
    if (!ms || ms < 10000 || ms > 7 * 24 * 60 * 60 * 1000) return ctx.reply('Durasi tidak valid. Contoh: `10m`, `1h`, `2d`.')
    const text = ctx.args.slice(1).join(' ')
    if (!text || text.length > 500) return ctx.reply('Pesan 1-500 karakter.')
    const triggerAt = Math.floor(Date.now() / 1000) + Math.floor(ms / 1000)
    const res = reminderModel.create(ctx.jid, ctx.sender, text, triggerAt)
    await ctx.reply(`📅 Jadwal dibuat! Akan dikirim dalam ${formatDuration(ms)}.\nID: #${res.lastInsertRowid}`)
  },
}
