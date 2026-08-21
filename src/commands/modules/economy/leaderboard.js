import { walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'leaderboard',
  aliases: ['topkaya', 'lbkaya', 'richest'],
  category: 'economy',
  description: 'Top 10 terkaya (cash + bank)',
  cooldown: 5000,
  async execute(ctx) {
    const top = walletModel.leaderboard(10)
    if (!top.length) return ctx.reply('Belum ada data kekayaan.')
    const lines = top.map((r, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      return `${medal} @${r.jid.split('@')[0]} — ${F.formatNumber(r.total)} (💵${F.formatNumber(r.cash)} + 🏦${F.formatNumber(r.bank)})`
    })
    await ctx.reply(`*Top 10 Terkaya*\n\n${lines.join('\n')}`, {
      mentions: top.map(r => r.jid),
    })
  },
}
