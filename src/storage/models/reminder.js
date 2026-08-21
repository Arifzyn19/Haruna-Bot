import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

class ReminderModel {
  _insert = lazyPrepare('INSERT INTO reminders (jid, sender, text, trigger_at) VALUES (@jid, @sender, @text, @trigger_at)')
  _findDue = lazyPrepare('SELECT * FROM reminders WHERE trigger_at <= ? ORDER BY trigger_at ASC')
  _delete = lazyPrepare('DELETE FROM reminders WHERE id = ?')
  _listByJid = lazyPrepare('SELECT * FROM reminders WHERE jid = ? ORDER BY trigger_at ASC')
  _listBySender = lazyPrepare('SELECT * FROM reminders WHERE sender = ? ORDER BY trigger_at ASC LIMIT 10')
  _countBySender = lazyPrepare('SELECT COUNT(*) as c FROM reminders WHERE sender = ?')
  _countByJid = lazyPrepare('SELECT COUNT(*) as c FROM reminders WHERE jid = ?')

  create(jid, sender, text, triggerAt) {
    return this._insert().run({ jid, sender, text, trigger_at: triggerAt })
  }

  findDue(now = Math.floor(Date.now() / 1000)) {
    return this._findDue().all(now)
  }

  delete(id) {
    return this._delete().run(id)
  }

  listByJid(jid) {
    return this._listByJid().all(jid)
  }

  listBySender(sender) {
    return this._listBySender().all(sender)
  }

  countBySender(sender) {
    return this._countBySender().get(sender)?.c ?? 0
  }

  countByJid(jid) {
    return this._countByJid().get(jid)?.c ?? 0
  }
}

export const reminderModel = new ReminderModel()
