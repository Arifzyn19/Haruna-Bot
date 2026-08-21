import { groupActivityModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'rank',
  aliases: ['level', 'xp'],
  category: 'group',
  description: 'Cek level & XP di grup',
  groupOnly: true,
  cooldown: 3000,
  async execute(ctx) {
    const target = ctx.quoted?.sender ?? ctx.sender
    const data = groupActivityModel.get(ctx.jid, target)
    if (!data) return ctx.reply('Belum ada XP. Coba chat dulu di grup ini.')
    const nextXp = groupActivityModel.xpForNext(data.level)
    const need = nextXp - data.xp
    const rank = groupActivityModel.rank(ctx.jid, target)
    const mention = target === ctx.sender ? 'Kamu' : `@${target.split('@')[0]}`
    await ctx.reply(
      `${mention} — *Level ${data.level}* (#${rank})\n` +
      `XP: ${F.formatNumber(data.xp)} / ${F.formatNumber(nextXp)} (butuh ${F.formatNumber(need)} lagi)\n` +
      `Pesan: ${F.formatNumber(data.message_count)}`,
      target !== ctx.sender ? { mentions: [target] } : undefined
    )
  },
}
