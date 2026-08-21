import { financeModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const CATEGORIES = {
  makan: ['makan', 'kopi', 'minum', 'jajan', 'warteg', 'mcd', 'kfc'],
  transport: ['bensin', 'parkir', 'ojek', 'grab', 'gojek', 'bus', 'bensin'],
  belanja: ['belanja', 'shopee', 'tokped', 'market', 'beli'],
  gaji: ['gaji', 'salary', 'income', 'masuk'],
  hiburan: ['nonton', 'game', 'topup', 'hiburan'],
}

function detectCategory(note) {
  const lower = note.toLowerCase()
  for (const [cat, kws] of Object.entries(CATEGORIES)) {
    if (kws.some(k => lower.includes(k))) return cat
  }
  return 'lainnya'
}

export default {
  name: 'catat',
  aliases: ['finance', 'keuangan', 'uang'],
  category: 'economy',
  description: 'Catat keuangan — !catat 50000 makan siang | !catat +100000 gaji',
  cooldown: 3000,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(ctx.args[1])
      if (!id) return ctx.reply('Usage: `!catat hapus <id>`')
      const ok = financeModel.delete(ctx.sender, id)
      return ctx.reply(ok ? `✅ Record #${id} dihapus.` : `Record #${id} tidak ditemukan.`)
    }

    if (sub === 'export' || sub === 'csv') {
      const all = financeModel.all(ctx.sender)
      if (!all.length) return ctx.reply('Belum ada data.')
      const csv = 'id,type,amount,category,note,date\n' + all.map(r =>
        `${r.id},${r.type},${r.amount},${r.category},"${r.note.replace(/"/g, '""')}",${new Date(r.created_at * 1000).toISOString().slice(0, 10)}`
      ).join('\n')
      await ctx.send({ document: Buffer.from(csv), mimetype: 'text/csv', fileName: 'keuangan.csv', caption: `Export ${all.length} records` })
      return
    }

    if (!sub || sub === 'list' || sub === 'ringkasan') {
      const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
      const s = financeModel.summary(ctx.sender, since)
      const income = s.income || 0
      const expense = s.expense || 0
      const saldo = income - expense
      const list = financeModel.list(ctx.sender, 5)
      let text = `*Keuangan 30 hari*\n\n💰 Masuk: ${F.formatNumber(income)}\n💸 Keluar: ${F.formatNumber(expense)}\n${saldo >= 0 ? '✅' : '❌'} Saldo: ${F.formatNumber(saldo)}\n`
      if (list.length) {
        text += `\n*5 Terakhir:*\n`
        for (const r of list) {
          const sign = r.type === 'income' ? '+' : '-'
          text += `${sign}${F.formatNumber(r.amount)} [${r.category}] ${r.note.slice(0, 20)} (#${r.id})\n`
        }
      }
      text += `\n_Catat: \`!catat 50000 makan\` / \`!catat +100000 gaji\`_`
      return ctx.reply(text)
    }

    // Parse: !catat 50000 makan siang  OR  !catat +100000 gaji
    let rawAmount = sub
    let noteStart = 1
    // Handle + prefix
    const isIncome = rawAmount.startsWith('+')
    if (isIncome) rawAmount = rawAmount.slice(1)

    const amount = parseInt(rawAmount.replace(/[^0-9]/g, ''))
    if (!amount || amount <= 0 || amount > 100_000_000) return ctx.reply('Jumlah tidak valid. Contoh: `!catat 50000 makan` atau `!catat +100000 gaji`')

    const note = ctx.args.slice(noteStart).join(' ').trim() || 'tanpa keterangan'
    if (note.length > 200) return ctx.reply('Keterangan maks 200 karakter.')

    const type = isIncome ? 'income' : 'expense'
    const category = detectCategory(note)
    const res = financeModel.add(ctx.sender, type, amount, category, note)
    const sign = type === 'income' ? '+' : '-'
    await ctx.reply(`✅ Dicatat: ${sign}${F.formatNumber(amount)} [${category}] ${note} (#${res.lastInsertRowid})`)
  },
}
