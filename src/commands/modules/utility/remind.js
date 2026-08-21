import { reminderModel } from '#storage/models/index.js'
import { parseDuration, formatDuration } from '#helpers/duration.js'

export default {
  name: 'remind',
  aliases: ['reminder', 'pengingat'],
  category: 'utility',
  description: 'Set pengingat: !remind 10m <pesan> | !remind list | !remind hapus <id>',
  cooldown: 3000,
  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()

    if (sub === 'list' || sub === 'daftar') {
      const list = reminderModel.listBySender(ctx.sender)
      if (!list.length) return ctx.reply('Tidak ada pengingat aktif.')
      const lines = list.map(r => `#${r.id} — ${r.text.slice(0, 40)} (⏰ ${new Date(r.trigger_at * 1000).toLocaleString('id-ID')})`)
      return ctx.reply(`*Pengingat kamu:*\n${lines.join('\n')}`)
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(ctx.args[1])
      if (!id) return ctx.reply('Usage: `!remind hapus <id>`')
      reminderModel.delete(id)
      return ctx.reply(`Pengingat #${id} dihapus.`)
    }

    if (!ctx.args[0] || !ctx.args[1]) {
      return ctx.reply('Usage: `!remind 10m <pesan>` | `!remind 1h <pesan>` | `!remind list`')
    }

    if (reminderModel.countBySender(ctx.sender) >= 5) {
      return ctx.reply('Maks 5 pengingat aktif per user. Hapus dulu dengan `!remind hapus <id>`.')
    }

    const ms = parseDuration(ctx.args[0])
    if (!ms || ms < 10000 || ms > 7 * 24 * 60 * 60 * 1000) {
      return ctx.reply('Durasi tidak valid. Contoh: `10m`, `1h`, `2d` (min 10 detik, max 7 hari).')
    }

    const text = ctx.args.slice(1).join(' ')
    if (!text || text.length > 500) return ctx.reply('Pesan pengingat 1-500 karakter.')

    const triggerAt = Math.floor(Date.now() / 1000) + Math.floor(ms / 1000)
    const res = reminderModel.create(ctx.jid, ctx.sender, text, triggerAt)
    await ctx.reply(`⏰ Pengingat diatur! Akan mengingatkan dalam ${formatDuration(ms)}.\nID: #${res.lastInsertRowid}\nPesan: ${text}`)
  },
}
