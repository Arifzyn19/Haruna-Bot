import { createCanvas, loadImage } from '@napi-rs/canvas'

const W = 700, H = 350

export async function generateWelcomeCard({ name, groupName, memberCount, avatarUrl, action = 'welcome' }) {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Full background - rich gradient covering entire canvas
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0f0520')
  bg.addColorStop(0.35, '#1a0a2e')
  bg.addColorStop(0.65, '#2d1b4e')
  bg.addColorStop(1, '#3d1a3a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Large background glows - full coverage
  ctx.fillStyle = 'rgba(255,105,180,0.12)'
  ctx.beginPath(); ctx.arc(650, 80, 140, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(120,80,255,0.10)'
  ctx.beginPath(); ctx.arc(80, 280, 110, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(255,105,180,0.07)'
  ctx.beginPath(); ctx.arc(400, 320, 180, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(80,60,180,0.08)'
  ctx.beginPath(); ctx.arc(150, 40, 90, 0, Math.PI * 2); ctx.fill()

  // Subtle grid pattern overlay
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // Outer border
  ctx.strokeStyle = 'rgba(255,105,180,0.25)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(6, 6, W - 12, H - 12)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.strokeRect(8, 8, W - 16, H - 16)

  // Avatar - vertically centered
  const cx = 155, cy = H / 2, r = 78

  // Glow behind avatar
  ctx.fillStyle = 'rgba(255,105,180,0.25)'
  ctx.beginPath(); ctx.arc(cx, cy, r + 18, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(120,80,255,0.15)'
  ctx.beginPath(); ctx.arc(cx, cy, r + 28, 0, Math.PI * 2); ctx.fill()

  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip()
  ctx.fillStyle = '#1e1040'
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl)
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
    } catch {}
  } else {
    ctx.fillStyle = '#ff69b4'
    ctx.font = 'bold 52px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((name?.[0] || '?').toUpperCase(), cx, cy)
  }
  ctx.restore()

  // Avatar rings
  ctx.strokeStyle = '#ff69b4'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,105,180,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(cx, cy, r + 7, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, Math.PI * 2); ctx.stroke()

  // Right content - vertically centered block
  const tx = 270
  const centerY = H / 2

  // Semi-transparent card behind text for coverage
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.beginPath()
  ctx.roundRect(tx - 12, centerY - 110, 410, 220, 14)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(tx - 12, centerY - 110, 410, 220, 14)
  ctx.stroke()

  ctx.textAlign = 'left'

  // Action label
  ctx.fillStyle = '#ff69b4'
  ctx.font = '700 11px sans-serif'
  const label = action === 'welcome' ? '✦  W E L C O M E' : '✦  G O O D B Y E'
  ctx.fillText(label, tx, centerY - 70)

  // Name - centered in card
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px sans-serif'
  const displayName = (name || 'Member').slice(0, 20)
  ctx.fillText(displayName, tx, centerY - 36)

  // Divider
  ctx.fillStyle = '#ff69b4'
  ctx.fillRect(tx, centerY - 20, 36, 3)

  // Group name
  ctx.fillStyle = '#d4d4d8'
  ctx.font = '13px sans-serif'
  const gName = (groupName || 'Group').slice(0, 32)
  ctx.fillText(`di  ${gName}`, tx, centerY + 4)

  // Member count badge - centered
  const badgeText = `#${memberCount}  Member`
  ctx.font = '700 11px sans-serif'
  const tw = ctx.measureText(badgeText).width
  const bx = tx, by = centerY + 22, bw = tw + 22, bh = 26
  const badgeGrad = ctx.createLinearGradient(bx, by, bx + bw, by)
  badgeGrad.addColorStop(0, '#ff69b4')
  badgeGrad.addColorStop(1, '#a855f7')
  ctx.fillStyle = badgeGrad
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, 13)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.fillText(badgeText, bx + 11, by + 17)

  // Sub text
  ctx.fillStyle = '#a1a1aa'
  ctx.font = '11px sans-serif'
  ctx.fillText(action === 'welcome' ? 'Semoga betah & jangan lupa baca rules!' : 'Thanks udah mampir, sampai jumpa lagi!', tx, centerY + 58)

  // Footer centered
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('HarunaBot  •  Powered by Baileys', W / 2, H - 14)

  // Sparkles
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  for (const [x, y, s] of [[320, 60, 1.8], [620, 140, 1.2], [520, 90, 1], [280, 260, 1.5], [600, 300, 1]]) {
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill()
  }

  const buf = await canvas.encode('png')
  return Buffer.from(buf)
}
