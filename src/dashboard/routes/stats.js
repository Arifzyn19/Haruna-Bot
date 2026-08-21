import os from 'os'

export function statsRoutes(app, { commandRegistry, orchestrator }) {
  app.get('/api/stats', (req, res) => {
    res.json({
      bot: { name: process.env.BOT_NAME || 'HarunaBot', version: '4.0.0-beta', uptime: process.uptime() },
      system: { platform: os.platform(), arch: os.arch(), node: process.version, ram: { total: os.totalmem(), free: os.freemem() }, hostname: os.hostname() },
      modules: { commands: commandRegistry.count(), extensions: orchestrator.count() },
    })
  })
}
