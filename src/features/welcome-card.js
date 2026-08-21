import { createCanvas, loadImage } from '@napi-rs/canvas'

const W = 700, H = 350

export async function generateWelcomeCard({ name, groupName, memberCount, avatarUrl, action = 'welcome' }) {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#1a0a2e')
  grad.addColorStop(0.5, '#2d1b4e')
  grad.addColorStop(1, '#4a1a3a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Decorative circles
  ctx.fillStyle = 'rgba(255,105,180,0.08)'
  ctx.beginPath(); ctx.arc(600, 50, 80, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(80, 300, 60, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(500, 280, 40, 0, Math.PI * 2); ctx.fill()

  // Border
  ctx.strokeStyle = 'rgba(255,105,180,0.3)'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, W - 8, H - 8)

  // Avatar
  const cx = 140, cy = 140, r = 80
  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip()

  // Avatar bg placeholder
  ctx.fillStyle = '#2d1b4e'
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2)

  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl)
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
    } catch {}
  } else {
    ctx.fillStyle = '#ff69b4'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((name?.[0] || '?').toUpperCase(), cx, cy)
  }
  ctx.restore()

  // Avatar border
  ctx.strokeStyle = '#ff69b4'
  ctx.lineWidth = 4
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,105,180,0.4)'
  ctx.lineWidth = 8
  ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2); ctx.stroke()

  // Text area (right side)
  const tx = 260
  ctx.textAlign = 'left'

  // Action label
  ctx.fillStyle = '#ff69b4'
  ctx.font = '600 13px sans-serif'
  ctx.fillText(action === 'welcome' ? '✦  WELCOME' : '✦  GOODBYE', tx, 60)

  // Name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  const displayName = (name || 'Member').slice(0, 18)
  ctx.fillText(displayName, tx, 100)

  // Divider
  ctx.fillStyle = 'rgba(255,105,180,0.5)'
  ctx.fillRect(tx, 115, 40, 2)

  // Group
  ctx.fillStyle = '#e4e4e7'
  ctx.font = '14px sans-serif'
  const gName = (groupName || 'Group').slice(0, 28)
  ctx.fillText(`di  ${gName}`, tx, 140)

  // Member count badge
  const badgeText = `#${memberCount}  Member`
  ctx.font = '600 12px sans-serif'
  const tw = ctx.measureText(badgeText).width
  const bx = tx, by = 165, bw = tw + 20, bh = 24
  ctx.fillStyle = 'rgba(255,105,180,0.2)'
  ctx.beginPath()
  const rr = 12
  ctx.roundRect(bx, by, bw, bh, rr)
  ctx.fill()
  ctx.fillStyle = '#ffb3d9'
  ctx.fillText(badgeText, bx + 10, by + 16)

  // Footer
  ctx.fillStyle = '#71717a'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('HarunaBot  •  Powered by Baileys', W / 2, H - 18)

  // Small sparkles
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  for (const [x, y, s] of [[320, 200, 2], [600, 200, 1.5], [500, 100, 1], [90, 80, 2]]) {
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill()
  }

  const buf = await canvas.encode('png')
  return Buffer.from(buf)
}
