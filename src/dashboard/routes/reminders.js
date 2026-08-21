import { reminderModel } from '#storage/models/index.js'

export function remindersRoutes(app) {
  app.get('/api/reminders', (req, res) => {
    const all = reminderModel.findDue ? reminderModel.findDue(Number.MAX_SAFE_INTEGER) : []
    const fromDb = all.length ? all : []
    res.json(fromDb.slice(0, 100))
  })

  app.delete('/api/reminders/:id', (req, res) => {
    reminderModel.delete(parseInt(req.params.id))
    res.json({ ok: true })
  })
}
