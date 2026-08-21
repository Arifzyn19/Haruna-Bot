import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { logger } from '#helpers/logger.js'
import SETTINGS from '#environment/settings.js'
import { authMiddleware } from './middleware/auth.js'
import { statsRoutes } from './routes/stats.js'
import { groupsRoutes } from './routes/groups.js'
import { usersRoutes } from './routes/users.js'
import { remindersRoutes } from './routes/reminders.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

let server = null

export function startDashboard({ commandRegistry, orchestrator }) {
  if (!SETTINGS.dashEnabled) return null
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(express.static(join(__dirname, 'public')))

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use('/api', authMiddleware)
  statsRoutes(app, { commandRegistry, orchestrator })
  groupsRoutes(app)
  usersRoutes(app)
  remindersRoutes(app)

  const host = SETTINGS.dashPublic ? '0.0.0.0' : '127.0.0.1'
  server = app.listen(SETTINGS.dashPort, host, () => {
    logger.info(`[Dashboard] http://${host}:${SETTINGS.dashPort} ${SETTINGS.dashToken ? '(auth)' : '(no token)'}`)
    if (SETTINGS.dashPublic && !SETTINGS.dashToken) logger.warn('[Dashboard] Public without DASH_TOKEN — insecure!')
  })
  return server
}

export function stopDashboard() {
  if (server) { server.close(); server = null }
}
