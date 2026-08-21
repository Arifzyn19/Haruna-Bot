import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

class FinanceModel {
  _insert = lazyPrepare('INSERT INTO finance_records (jid, type, amount, category, note) VALUES (@jid, @type, @amount, @category, @note)')
  _list = lazyPrepare('SELECT * FROM finance_records WHERE jid = ? ORDER BY created_at DESC LIMIT ?')
  _summary = lazyPrepare(`
    SELECT
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense,
      COUNT(*) as count
    FROM finance_records WHERE jid = ? AND created_at >= ?
  `)
  _delete = lazyPrepare('DELETE FROM finance_records WHERE id = ? AND jid = ?')
  _all = lazyPrepare('SELECT * FROM finance_records WHERE jid = ? ORDER BY created_at DESC')

  add(jid, type, amount, category, note) {
    return this._insert().run({ jid, type, amount, category, note: note || '' })
  }

  list(jid, limit = 10) {
    return this._list().all(jid, limit)
  }

  summary(jid, since) {
    return this._summary().get(jid, since) ?? { income: 0, expense: 0, count: 0 }
  }

  delete(jid, id) {
    return this._delete().run(id, jid).changes > 0
  }

  all(jid) {
    return this._all().all(jid)
  }
}

export const financeModel = new FinanceModel()
