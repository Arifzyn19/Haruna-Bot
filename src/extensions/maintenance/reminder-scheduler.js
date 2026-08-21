import { reminderModel } from '#storage/models/index.js'
import { getSocket } from '#helpers/shutdown.js'
import { logger } from '#helpers/logger.js'

let interval = null

export default {
  name: 'reminder-scheduler',
  async init() {
    interval = setInterval(async () => {
      const sock = getSocket()
      if (!sock) return
      try {
        const due = reminderModel.findDue()
        for (const r of due) {
          try {
            await sock.sendMessage(r.jid, { text: `⏰ *Reminder*\n\n${r.text}\n\n_Dari @${r.sender.split('@')[0]}_`, mentions: [r.sender] })
            reminderModel.delete(r.id)
          } catch (err) {
            logger.warn({ err: err.message, id: r.id }, '[Reminder] send failed')
            if (String(err.message).includes('sendMessage')) {
              // sock error, keep for retry
            } else {
              reminderModel.delete(r.id)
            }
          }
        }
      } catch (err) {
        logger.warn({ err: err.message }, '[Reminder] tick failed')
      }
    }, 30_000)
    logger.info('[Reminder] Scheduler started — 30s interval')
  },
  async destroy() {
    if (interval) clearInterval(interval)
    interval = null
  },
}
