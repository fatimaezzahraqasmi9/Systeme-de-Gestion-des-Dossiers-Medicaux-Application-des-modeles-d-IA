import { jsPDF } from 'jspdf'

const COLOR_PRIMARY = [30, 130, 120]   // teal
const COLOR_DARK    = [30, 30, 30]
const COLOR_GRAY    = [120, 120, 120]
const COLOR_LIGHT   = [240, 248, 246]

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function humanize(s) {
  return s?.replace(/_/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? s
}

export function generateOrdonnancePDF({ consultation, medecinPrenom, medecinNom }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const MARGIN = 20
  const CONTENT_W = W - MARGIN * 2
  let y = 0

  // ── Helpers ─────────────────────────────────────────────────────────────
  const setColor = ([r, g, b]) => { doc.setTextColor(r, g, b) }
  const setFill  = ([r, g, b]) => { doc.setFillColor(r, g, b) }
  const setDraw  = ([r, g, b]) => { doc.setDrawColor(r, g, b) }

  const text = (str, x, yPos, opts = {}) => doc.text(str, x, yPos, opts)

  const sectionTitle = (label, yPos) => {
    setFill(COLOR_PRIMARY)
    doc.rect(MARGIN, yPos - 5, CONTENT_W, 8, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    setColor([255, 255, 255])
    text(label.toUpperCase(), MARGIN + 4, yPos + 0.5)
    setColor(COLOR_DARK)
    return yPos + 10
  }

  const row = (label, value, yPos) => {
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    setColor(COLOR_GRAY)
    text(label, MARGIN + 2, yPos)
    doc.setFont('helvetica', 'normal')
    setColor(COLOR_DARK)
    const lines = doc.splitTextToSize(String(value || '—'), CONTENT_W - 50)
    text(lines, MARGIN + 50, yPos)
    return yPos + lines.length * 5.5 + 2
  }

  const divider = (yPos) => {
    setDraw(COLOR_PRIMARY)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, yPos, W - MARGIN, yPos)
    return yPos + 4
  }

  // ── En-tête ──────────────────────────────────────────────────────────────
  setFill(COLOR_PRIMARY)
  doc.rect(0, 0, W, 30, 'F')

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  setColor([255, 255, 255])
  text('CLINIQUE UNION', MARGIN, 13)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  text('Système de Gestion des Dossiers Médicaux', MARGIN, 21)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  text('ORDONNANCE MÉDICALE', W - MARGIN, 13, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  text(`Date : ${formatDate(consultation.dateConsultation || new Date())}`, W - MARGIN, 21, { align: 'right' })

  y = 38

  // ── Référence ────────────────────────────────────────────────────────────
  setFill(COLOR_LIGHT)
  doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  setColor(COLOR_GRAY)
  text(`Réf. consultation : #${consultation.id ?? '—'}    Généré le : ${formatDate(new Date())}`, MARGIN + 4, y + 6.5)
  y += 16

  // ── Médecin ──────────────────────────────────────────────────────────────
  y = sectionTitle('Informations du médecin', y)
  y = row('Médecin :', `Dr ${medecinPrenom ?? ''} ${medecinNom ?? ''}`, y)
  y += 2

  // ── Patient ──────────────────────────────────────────────────────────────
  y = sectionTitle('Informations du patient', y)
  y = row('Patient :', consultation.patientNom ?? '—', y)
  y += 2

  // ── Consultation ─────────────────────────────────────────────────────────
  y = sectionTitle('Détails de la consultation', y)
  y = row('Date :', formatDate(consultation.dateConsultation), y)
  y = row('Motif :', consultation.motif, y)
  if (consultation.diagnostic) {
    y = row('Diagnostic :', consultation.diagnostic, y)
  }
  y += 2

  // ── Symptômes ─────────────────────────────────────────────────────────────
  if (consultation.symptomes?.length > 0) {
    y = sectionTitle('Symptômes analysés', y)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    setColor(COLOR_DARK)
    const cols = 3
    const colW = CONTENT_W / cols
    consultation.symptomes.forEach((s, i) => {
      const col = i % cols
      const line = Math.floor(i / cols)
      text(`• ${humanize(s)}`, MARGIN + 2 + col * colW, y + line * 5.5)
    })
    y += Math.ceil(consultation.symptomes.length / cols) * 5.5 + 4
  }

  // ── Prédiction IA ─────────────────────────────────────────────────────────
  if (consultation.predictionIA) {
    y = sectionTitle('Prédiction Intelligence Artificielle', y)
    const p = consultation.predictionIA
    setFill(COLOR_LIGHT)
    doc.roundedRect(MARGIN, y, CONTENT_W, 20, 2, 2, 'F')

    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    setColor(COLOR_PRIMARY)
    text('Maladie la plus probable :', MARGIN + 4, y + 7)
    doc.setFontSize(13)
    text(p.maladiePredite ?? '—', MARGIN + 4, y + 15)

    if (p.probabilite != null) {
      const pct = `${(p.probabilite * 100).toFixed(0)}%`
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'bold')
      setColor(COLOR_GRAY)
      text('Indice de confiance :', W - MARGIN - 4, y + 7, { align: 'right' })
      doc.setFontSize(18)
      setColor(COLOR_PRIMARY)
      text(pct, W - MARGIN - 4, y + 16, { align: 'right' })
    }
    y += 26
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'italic')
    setColor(COLOR_GRAY)
    const disclaimer = 'Ce résultat est fourni à titre indicatif et ne remplace pas le jugement clinique du médecin.'
    text(disclaimer, MARGIN + 2, y)
    y += 7
  }

  // ── Ordonnance / Notes ────────────────────────────────────────────────────
  if (consultation.ordonnanceNotes) {
    y = sectionTitle('Ordonnance / Notes du médecin', y)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'normal')
    setColor(COLOR_DARK)

    const lines = doc.splitTextToSize(consultation.ordonnanceNotes, CONTENT_W - 8)

    // Fond léger pour la zone ordonnance
    setFill([255, 255, 240])
    doc.setDrawColor(200, 200, 100)
    doc.setLineWidth(0.2)
    const boxH = lines.length * 5.5 + 8
    doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'FD')

    setColor(COLOR_DARK)
    text(lines, MARGIN + 4, y + 6)
    y += boxH + 4
  }

  // ── Signature ─────────────────────────────────────────────────────────────
  y = Math.max(y, 240)
  y = divider(y)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setColor(COLOR_DARK)
  text(`Dr ${medecinPrenom ?? ''} ${medecinNom ?? ''}`, W - MARGIN - 40, y + 8)
  doc.setFont('helvetica', 'normal')
  setColor(COLOR_GRAY)
  text('Signature du médecin', W - MARGIN - 40, y + 14)
  doc.line(W - MARGIN - 70, y + 10, W - MARGIN, y + 10)

  // ── Pied de page ──────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight()
  setFill(COLOR_PRIMARY)
  doc.rect(0, pageH - 12, W, 12, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  setColor([255, 255, 255])
  text('Clinique Union — Document généré automatiquement — Confidentiel', W / 2, pageH - 4.5, { align: 'center' })

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const filename = `ordonnance_${consultation.patientNom?.replace(/\s+/g, '_') ?? 'patient'}_${consultation.id ?? 'cons'}.pdf`
  doc.save(filename)
}
