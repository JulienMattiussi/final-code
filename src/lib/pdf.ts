import { HELVETICA, HELVETICA_BOLD, type FontMetrics } from '@/lib/fonts'
import { layoutFor, NOTE_MM, PAGE, rowOffsets, TITLE_MM } from '@/lib/layout'
import {
  AXIS_WIDTH_MM,
  baselineFor,
  CORNER,
  LETTER_SIZE,
  PALETTE,
  REF_GAP,
  REF_SIZE,
  RULE_WIDTH_MM,
} from '@/lib/style'
import type { Grid, SheetOptions } from '@/lib/types'

/**
 * Écrit un PDF directement, sans aucune bibliothèque.
 *
 * C'est la seule sortie vraiment maîtrisée : une page web ne peut pas empêcher
 * le navigateur d'ajouter ses en-têtes et sa pagination à l'impression, et son
 * échelle dépend des réglages du dialogue. Ici la page fait exactement 210 x 297
 * millimètres et rien ne s'y ajoute.
 *
 * Le texte n'est pas embarqué : Helvetica et son gras font partie des quatorze
 * polices que tout lecteur PDF possède, et `fonts.ts` contient leurs largeurs
 * exactes. C'est ce qui garantit que le PDF est le même dessin que l'aperçu,
 * plutôt qu'une approximation à recaler.
 */

/** Un point PostScript vaut 1/72 de pouce ; tout le PDF se mesure ainsi. */
const PER_MM = 72 / 25.4

/** Poignée de Bézier pour un quart de cercle, en part du rayon. */
const KAPPA = 0.5523

/**
 * Les caractères que WinAnsiEncoding place hors de Latin-1, entre 0x80 et 0x9F.
 * Partout ailleurs le codage se confond avec Latin-1.
 */
// prettier-ignore
const WIN_ANSI: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86,
  0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c,
  0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95,
  0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
  0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
}

export function renderPdf(grid: Grid, options: SheetOptions): Uint8Array<ArrayBuffer> {
  const layout = layoutFor(grid, options)
  const cell = layout.cellMm
  const offsets = rowOffsets(grid.groups)

  const body: string[] = [
    `${colour(PALETTE.paper)} rg`,
    `0 0 ${pt(PAGE.widthMm)} ${pt(PAGE.heightMm)} re f`,
  ]

  if (layout.titleY !== null) {
    body.push(
      text(
        options.title,
        HELVETICA_BOLD,
        TITLE_MM,
        PAGE.widthMm / 2,
        layout.titleY,
        0.5,
        PALETTE.ink,
      ),
    )
  }
  if (layout.noteY !== null) {
    body.push(
      text(options.note, HELVETICA, NOTE_MM, PAGE.widthMm / 2, layout.noteY, 0.5, PALETTE.label),
    )
  }

  grid.rows.forEach((row, index) => {
    const top = layout.gridY + offsets[index]! * cell
    const left = layout.gridX + row.start * cell

    if (row.word.ref.length > 0) {
      body.push(
        text(
          row.word.ref,
          HELVETICA,
          cell * REF_SIZE,
          left - cell * REF_GAP,
          top + cell * baselineFor(REF_SIZE),
          1,
          PALETTE.label,
        ),
      )
    }

    for (let column = 0; column < row.word.letters.length; column++) {
      const onAxis = row.start + column === grid.axis
      body.push(
        `${colour(onAxis ? PALETTE.axisFill : PALETTE.paper)} rg`,
        `${colour(PALETTE.rule)} RG`,
        `${round(RULE_WIDTH_MM * PER_MM)} w`,
        box(left + column * cell, top, cell, cell, cell * CORNER),
        // Remplir et tracer d'un coup : deux passes laisseraient un liseré blanc
        // entre le fond et le trait sur certains lecteurs.
        'B',
      )

      if (options.solution) {
        body.push(
          text(
            row.word.letters[column]!,
            HELVETICA,
            cell * LETTER_SIZE,
            left + (column + 0.5) * cell,
            top + cell * baselineFor(LETTER_SIZE),
            0.5,
            PALETTE.ink,
          ),
        )
      }
    }
  })

  let first = 0
  for (const size of grid.groups) {
    const top = layout.gridY + offsets[first]! * cell
    const height = (offsets[first + size - 1]! - offsets[first]! + 1) * cell
    body.push(
      `${colour(PALETTE.axisRule)} RG`,
      `${round(AXIS_WIDTH_MM * PER_MM)} w`,
      box(layout.gridX + grid.axis * cell, top, cell, height, cell * CORNER),
      'S',
    )
    first += size
  }

  return assemble(body.join('\n'), options.title.length > 0 ? options.title : 'Grille de mots')
}

/**
 * Un rectangle à coins arrondis, décrit du même coin et dans le même sens que le
 * `rx` du SVG. Le PDF n'a pas d'arc : quatre courbes de Bézier en tiennent lieu,
 * à un demi-millième de rayon près.
 */
function box(
  xMm: number,
  topMm: number,
  widthMm: number,
  heightMm: number,
  radiusMm: number,
): string {
  const x0 = pt(xMm)
  const x1 = pt(xMm + widthMm)
  // L'origine du PDF est en bas à gauche et son axe vertical monte, donc le haut
  // de la case a l'ordonnée la plus grande.
  const y1 = pt(PAGE.heightMm - topMm)
  const y0 = pt(PAGE.heightMm - topMm - heightMm)
  const r = pt(radiusMm)
  const k = r * KAPPA

  return [
    `${round(x0 + r)} ${round(y0)} m`,
    `${round(x1 - r)} ${round(y0)} l`,
    `${round(x1 - r + k)} ${round(y0)} ${round(x1)} ${round(y0 + r - k)} ${round(x1)} ${round(y0 + r)} c`,
    `${round(x1)} ${round(y1 - r)} l`,
    `${round(x1)} ${round(y1 - r + k)} ${round(x1 - r + k)} ${round(y1)} ${round(x1 - r)} ${round(y1)} c`,
    `${round(x0 + r)} ${round(y1)} l`,
    `${round(x0 + r - k)} ${round(y1)} ${round(x0)} ${round(y1 - r + k)} ${round(x0)} ${round(y1 - r)} c`,
    `${round(x0)} ${round(y0 + r)} l`,
    `${round(x0)} ${round(y0 + r - k)} ${round(x0 + r - k)} ${round(y0)} ${round(x0 + r)} ${round(y0)} c`,
    'h',
  ].join('\n')
}

/**
 * Un texte posé sur sa ligne de base. `align` vaut 0 à gauche, 0,5 centré, 1 à
 * droite : le PDF n'a pas d'ancrage comme le SVG, il faut reculer soi-même de la
 * largeur mesurée.
 */
function text(
  value: string,
  font: FontMetrics,
  sizeMm: number,
  xMm: number,
  baselineMm: number,
  align: number,
  fill: string,
): string {
  const codes = [...value].map((char) => char.codePointAt(0) ?? 32)
  const size = pt(sizeMm)
  const width = codes.reduce((total, code) => total + (font.widths[code] ?? font.fallback), 0)
  const x = pt(xMm) - (width / 1000) * size * align

  const escaped = codes.map(escapeByte).join('')
  return [
    `${colour(fill)} rg`,
    'BT',
    `/${font === HELVETICA_BOLD ? 'F2' : 'F1'} ${round(size)} Tf`,
    `${round(x)} ${round(pt(PAGE.heightMm - baselineMm))} Td`,
    `(${escaped}) Tj`,
    'ET',
  ].join('\n')
}

function pt(millimetres: number): number {
  return millimetres * PER_MM
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/** Couleur de remplissage ou de trait, convertie du `#rrggbb` de la palette. */
function colour(hex: string): string {
  const value = parseInt(hex.slice(1), 16)
  const channel = (shift: number): number => round(((value >> shift) & 0xff) / 255)
  return `${channel(16)} ${channel(8)} ${channel(0)}`
}

/**
 * Échappe un caractère pour une chaîne PDF.
 *
 * Tout ce qui sort de l'ASCII est écrit en échappement octal plutôt qu'en octet
 * brut. Ce n'est pas seulement plus lisible : ça garantit qu'un caractère de la
 * source vaut un octet du fichier, dont dépendent les décalages de la table
 * `xref`. Un « é » écrit tel quel les décalerait tous.
 */
function escapeByte(code: number): string {
  const byte = code <= 0x7e ? code : (WIN_ANSI[code] ?? (code <= 0xff ? code : 0x3f))

  if (byte === 0x28 || byte === 0x29 || byte === 0x5c) return `\\${String.fromCharCode(byte)}`
  if (byte >= 0x20 && byte <= 0x7e) return String.fromCharCode(byte)
  return `\\${byte.toString(8).padStart(3, '0')}`
}

/**
 * Assemble les objets, la table des références croisées et la fin de fichier.
 * Les décalages de `xref` sont des positions d'octets exactes : tout est en
 * ASCII, un caractère vaut donc un octet.
 */
function assemble(content: string, title: string): Uint8Array<ArrayBuffer> {
  const width = round(pt(PAGE.widthMm))
  const height = round(pt(PAGE.heightMm))
  const escaped = [...title].map((char) => escapeByte(char.codePointAt(0) ?? 32)).join('')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
      '/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /${HELVETICA.postscript} /Encoding /WinAnsiEncoding >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /${HELVETICA_BOLD.postscript} /Encoding /WinAnsiEncoding >>`,
    `<< /Title (${escaped}) /Producer (final-code) >>`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xrefAt = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  // Chaque entrée pèse exactement 20 octets, la spécification l'impose.
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\n`
  pdf += `startxref\n${xrefAt}\n%%EOF\n`

  const bytes = new Uint8Array(pdf.length)
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff
  return bytes
}
