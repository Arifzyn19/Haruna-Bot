import { questModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'quest',
  aliases: ['quests', 'misi'],
  category: 'economy',
  description: 'Lihat quest harian',
  cooldown: 3000,
  async execute(ctx) {
    const quests = questModel.allQuests()
    if (!quests.length) return ctx.reply('Belum ada quest. Hubungi owner untuk seed.')
    const progress = questModel.getAllProgress(ctx.sender)
    const progMap = new Map(progress.map(p => [p.quest_id, p]))
    const lines = quests.slice(0, 5).map(q => {
      const p = progMap.get(q.id)
      const cur = p ? `${p.progress}/${q.goal}` : `0/${q.goal}`
      const done = p?.completed ? '✅' : '⏳'
      return `${done} *${q.name}* — ${q.description} (${cur}) 🎁 ${F.formatNumber(q.reward_cash)}`
    })
    await ctx.reply(`*Quest Harian*\n\n${lines.join('\n')}\n\nKetik \`!claim <id>\` untuk klaim.`)
  },
}
