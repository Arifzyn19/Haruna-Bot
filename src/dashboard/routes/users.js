import { db } from '#storage/connection.js'
import { userModel } from '#storage/models/index.js'

export function usersRoutes(app) {
  app.get('/api/users', (req, res) => {
    const q = (req.query.search || '').trim()
    try {
      if (q) {
        const rows = db.prepare("SELECT * FROM users WHERE jid LIKE ? OR push_name LIKE ? LIMIT 50").all(`%${q}%`, `%${q}%`)
        return res.json(rows)
      }
      const rows = db.prepare('SELECT * FROM users LIMIT 50').all()
      res.json(rows)
    } catch { res.json([]) }
  })

  app.post('/api/users/:jid/ban', (req, res) => {
    const jid = decodeURIComponent(req.params.jid)
    if (req.body.banned) userModel.ban(jid)
    else userModel.unban(jid)
    res.json({ ok: true })
  })

  app.post('/api/users/:jid/premium', (req, res) => {
    const jid = decodeURIComponent(req.params.jid)
    const days = parseInt(req.body.days) || 30
    if (days > 0) userModel.setPremium(jid, days * 24 * 60 * 60 * 1000)
    else userModel.removePremium(jid)
    res.json({ ok: true })
  })
}
