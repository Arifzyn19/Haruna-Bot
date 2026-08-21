import { groupActivityModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'

const XP_MIN = 15
const XP_MAX = 25
const COOLDOWN_MS = 60_000
const cooldown = new Map()

export default {
  name: 'group-leveling',
  async init() {
    logger.info('[GroupLeveling] Initialized')
  },
  async processMessage(parsed, sock) {
    if (!parsed.isGroup) return true
    if (!parsed.sender) return true
    const key = `${parsed.jid}:${parsed.sender}`
    const now = Date.now()
    if (cooldown.has(key) && now - cooldown.get(key) < COOLDOWN_MS) return true
    cooldown.set(key, now)
    if (cooldown.size > 5000) {
      for (const [k, v] of cooldown) if (now - v > COOLDOWN_MS) cooldown.delete(k)
    }
    try {
      const xp = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN
      const result = groupActivityModel.addXp(parsed.jid, parsed.sender, xp)
      if (result.leveledUp) {
        await sock.sendMessage(parsed.jid, {
          text: `🎉 Selamat @${parsed.sender.split('@')[0]} naik ke *Level ${result.after}* ! (${result.xp} XP)`,
          mentions: [parsed.sender],
        }).catch(() => {})
      }
    } catch (err) {
      logger.warn({ err: err.message }, '[GroupLeveling] XP failed')
    }
    return true
  },
}
