import { reminderModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'

let interval = null
let sockRef = null

export default {
  name: 'reminder-scheduler',
  async init(sock) {
    sockRef = sock
    interval = setInterval(async () => {
      try {
        const due = reminderModel.findDue()
        for (const r of due) {
          try {
            await sockRef.sendMessage(r.jid, { text: `⏰ *Reminder*\n\n${r.text}\n\n_Dari @${r.sender.split('@')[0]}_` , mentions: [r.sender] })
            reminderModel.delete(r.id)
          } catch (err) {
            logger.warn({ err: err.message, id: r.id }, '[Reminder] send failed')
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
