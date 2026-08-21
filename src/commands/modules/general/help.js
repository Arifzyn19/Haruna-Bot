import axios from 'axios'
import { commandRegistry } from '#commands/registry.js'
import { botConfigModel } from '#storage/models/index.js'
import SETTINGS from '#environment/settings.js'

const CAT_ICONS = { general: '📋', economy: '💰', rpg: '⚔️', shop: '🛒', group: '👥', owner: '👑', downloader: '📥', utility: '🔧', leveling: '⭐', ai: '🤖' }
const CAT_ORDER = ['general', 'group', 'economy', 'rpg', 'shop', 'downloader', 'utility', 'owner']

export default {
  name: 'help',
  aliases: ['h', 'menu'],
  category: 'general',
  description: 'Lihat semua command',
  cooldown: 5_000,

  async execute(ctx) {
    const arg = ctx.args[0]?.toLowerCase()
    const prefix = botConfigModel.get('bot_prefix') || SETTINGS.prefix
    const botName = botConfigModel.get('bot_name') || SETTINGS.botName

    if (arg) {
      const cmd = commandRegistry.get(arg)
      if (!cmd) return ctx.reply(`Command \`${prefix}${arg}\` tidak ditemukan. Ketik \`${prefix}help\` untuk daftar.`)
      const aliases = cmd.aliases?.length ? ` (${cmd.aliases.map(a => prefix + a).join(', ')})` : ''
      return ctx.reply(
        `*${prefix}${cmd.name}*${aliases}\n` +
        `Kategori: ${cmd.category}  •  Cooldown: ${cmd.cooldown ? cmd.cooldown / 1000 + 's' : '—'}\n` +
        `${cmd.description || 'No description'}\n` +
        (cmd.groupOnly ? '• Hanya di grup\n' : '') +
        (cmd.adminOnly ? '• Hanya admin grup\n' : '') +
        (cmd.ownerOnly ? '• Hanya owner\n' : '')
      )
    }

    const categories = [...commandRegistry.getCategories()].sort((a, b) => {
      const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
    })

    let text = `*${botName}*  —  ${commandRegistry.count()} commands  •  Prefix: \`${prefix}\`\n`
    text += `Ketik \`${prefix}help <nama>\` untuk detail.\n`
    text += `─`.repeat(22) + `\n\n`

    for (const cat of categories) {
      const cmds = [...commandRegistry.getByCategory(cat)].sort((a, b) => a.name.localeCompare(b.name))
      if (!cmds.length) continue
      const icon = CAT_ICONS[cat] ?? '📁'
      text += `${icon}  *${cat.toUpperCase()}* (${cmds.length})\n`
      for (const cmd of cmds) {
        const aliasStr = cmd.aliases?.length ? ` 〔${cmd.aliases.join(', ')}〕` : ''
        text += `  •  \`${prefix}${cmd.name}\`${aliasStr} — ${cmd.description || ''}\n`
      }
      text += `\n`
    }

    text += `_${commandRegistry.count()} commands • ${categories.length} kategori • HarunaBot_`
    text = text.trimEnd()

    const thumbUrl = botConfigModel.get('thumbnail_url')
    const footerText = botConfigModel.get('footer_text')
    if (thumbUrl) {
      try {
        const { data } = await axios.get(thumbUrl, { responseType: 'arraybuffer', timeout: 10_000 })
        const buf = Buffer.from(data)
        const settings = botConfigModel.getMenuConfig() ?? {}
        await ctx.sendLinkPreview(text, settings.url, settings.title, settings.desc, buf)
        return
      } catch {}
    }
    if (footerText) text += `\n\n_${footerText}_`
    await ctx.reply(text)
  },
}
