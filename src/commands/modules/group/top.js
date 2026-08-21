import { groupActivityModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'top',
  aliases: ['leaderboard', 'lb'],
  category: 'group',
  description: 'Top XP grup',
  groupOnly: true,
  cooldown: 3000,
  async execute(ctx) {
    const top = groupActivityModel.top(ctx.jid, 10)
    if (!top.length) return ctx.reply('Belum ada data. Chat dulu biar masuk leaderboard!')
    const lines = top.map((r, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      return `${medal} @${r.user_jid.split('@')[0]} — Lv.${r.level} (${F.formatNumber(r.xp)} XP)`
    })
    await ctx.reply(`*Top 10 XP — ${ctx.jid.split('@')[0]}*\n\n${lines.join('\n')}`, {
      mentions: top.map(r => r.user_jid),
    })
  },
}
