import { layoutFor, NOTE_MM, PAGE, rowOffsets, TITLE_MM } from '@/lib/layout'
import {
  AXIS_WIDTH_MM,
  baselineFor,
  CORNER,
  CSS_FONT,
  LETTER_SIZE,
  PALETTE,
  REF_GAP,
  REF_SIZE,
  RULE_WIDTH_MM,
} from '@/lib/style'
import type { Grid, SheetOptions } from '@/lib/types'

/**
 * La feuille en SVG, pour l'aperçu et l'impression du navigateur. L'export PDF
 * dessine la même chose avec les mêmes constantes ; les deux ne peuvent donc
 * différer que par ce que le format impose.
 */

export function renderSheet(grid: Grid, options: SheetOptions): string {
  const layout = layoutFor(grid, options)
  const cell = layout.cellMm
  const offsets = rowOffsets(grid.groups)

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE.widthMm} ${PAGE.heightMm}"` +
      ` width="${PAGE.widthMm}mm" height="${PAGE.heightMm}mm" role="img">`,
    `<title>${escapeText(options.title.length > 0 ? options.title : 'Grille de mots')}</title>`,
    `<rect width="${PAGE.widthMm}" height="${PAGE.heightMm}" fill="${PALETTE.paper}"/>`,
    `<g font-family="${CSS_FONT}" text-anchor="middle">`,
  ]

  if (layout.titleY !== null) {
    parts.push(
      `<text x="${PAGE.widthMm / 2}" y="${round(layout.titleY)}" font-size="${TITLE_MM}"` +
        ` font-weight="700" fill="${PALETTE.ink}">${escapeText(options.title)}</text>`,
    )
  }
  if (layout.noteY !== null) {
    parts.push(
      `<text x="${PAGE.widthMm / 2}" y="${round(layout.noteY)}" font-size="${NOTE_MM}"` +
        ` fill="${PALETTE.label}">${escapeText(options.note)}</text>`,
    )
  }

  grid.rows.forEach((row, index) => {
    const top = layout.gridY + offsets[index]! * cell
    const left = layout.gridX + row.start * cell

    if (row.word.ref.length > 0) {
      parts.push(
        `<text x="${round(left - cell * REF_GAP)}" y="${round(top + cell * baselineFor(REF_SIZE))}"` +
          ` text-anchor="end" font-size="${round(cell * REF_SIZE)}" fill="${PALETTE.label}">` +
          `${escapeText(row.word.ref)}</text>`,
      )
    }

    for (let column = 0; column < row.word.letters.length; column++) {
      const onAxis = row.start + column === grid.axis
      parts.push(
        `<rect x="${round(left + column * cell)}" y="${round(top)}"` +
          ` width="${round(cell)}" height="${round(cell)}" rx="${round(cell * CORNER)}"` +
          ` fill="${onAxis ? PALETTE.axisFill : PALETTE.paper}" stroke="${PALETTE.rule}"` +
          ` stroke-width="${RULE_WIDTH_MM}"/>`,
      )

      if (options.solution) {
        parts.push(
          `<text x="${round(left + (column + 0.5) * cell)}"` +
            ` y="${round(top + cell * baselineFor(LETTER_SIZE))}"` +
            ` font-size="${round(cell * LETTER_SIZE)}" fill="${PALETTE.ink}">` +
            `${row.word.letters[column]}</text>`,
        )
      }
    }
  })

  // La colonne solution est cerclée d'un trait épais par-dessus les cases : teintée
  // seulement, elle disparaîtrait à l'impression en noir et blanc. Un cadre par mot
  // de la solution, sinon le trait enjamberait le blanc qui les sépare.
  let first = 0
  for (const size of grid.groups) {
    const top = layout.gridY + offsets[first]! * cell
    const height = (offsets[first + size - 1]! - offsets[first]! + 1) * cell
    parts.push(
      `<rect x="${round(layout.gridX + grid.axis * cell)}" y="${round(top)}"` +
        ` width="${round(cell)}" height="${round(height)}" rx="${round(cell * CORNER)}"` +
        ` fill="none" stroke="${PALETTE.axisRule}" stroke-width="${AXIS_WIDTH_MM}"/>`,
    )
    first += size
  }

  parts.push('</g>', '</svg>')
  return parts.join('\n')
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Le titre et la consigne viennent de l'utilisateur : sans échappement, une
 * esperluette suffirait à produire un SVG invalide et un chevron à y injecter du
 * balisage.
 */
function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
