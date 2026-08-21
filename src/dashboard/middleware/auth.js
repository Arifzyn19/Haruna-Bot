import SETTINGS from '#environment/settings.js'

export function authMiddleware(req, res, next) {
  if (!SETTINGS.dashToken) return next()
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (token && token === SETTINGS.dashToken) return next()
  if (req.query.token === SETTINGS.dashToken) return next()
  return res.status(401).json({ error: 'Unauthorized — set Authorization: Bearer <DASH_TOKEN>' })
}
