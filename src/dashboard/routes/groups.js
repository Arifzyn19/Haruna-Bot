import { groupModel } from '#storage/models/index.js'
import { db } from '#storage/connection.js'

export function groupsRoutes(app) {
  app.get('/api/groups', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM groups LIMIT 100').all()
      res.json(rows)
    } catch { res.json([]) }
  })

  app.get('/api/groups/:jid/settings', (req, res) => {
    const jid = decodeURIComponent(req.params.jid)
    const g = groupModel.find(jid)
    if (!g) return res.status(404).json({ error: 'Group not found' })
    res.json(g)
  })

  app.put('/api/groups/:jid/settings', (req, res) => {
    const jid = decodeURIComponent(req.params.jid)
    const g = groupModel.find(jid)
    if (!g) return res.status(404).json({ error: 'Group not found' })
    groupModel.update(jid, req.body)
    res.json(groupModel.find(jid))
  })
}
