/**
 * Régénère `public/favicon.svg` depuis `src/lib/logo.ts`.
 *
 * Un favicon est servi tel quel : il ne peut ni importer de module ni exécuter
 * de calcul. Le recopier à la main revenait à entretenir deux versions de la
 * marque, et la deuxième dérivait dès la première retouche.
 *
 *   make favicon
 */
import { writeFileSync } from 'node:fs'
import { MARK, plainCells } from '@/lib/logo'
import { PALETTE } from '@/lib/style'

const BACKGROUND = PALETTE.ink
const RULE = '#64748b'
const AXIS = '#38bdf8'

/**
 * La marque est dessinée sur fond sombre, donc la colonne solution ne peut pas
 * garder le bleu très pâle de la feuille : à seize pixels, c'est le contraste
 * qui décide si l'icône se reconnaît, pas la fidélité de la teinte.
 */
const cells = plainCells()
  .map(
    (cell) =>
      `  <rect x="${cell.x}" y="${cell.y}" width="${MARK.cell}" height="${MARK.cell}"` +
      ` rx="${MARK.radius}" fill="none" stroke="${RULE}" stroke-width="3"/>`,
  )
  .join('\n')

const { x, y, width, height } = MARK.axis

const svg = `<!-- Généré par \`make favicon\` depuis src/lib/logo.ts. Ne pas éditer à la main. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK.box} ${MARK.box}" role="img" aria-label="final-code">
  <rect width="${MARK.box}" height="${MARK.box}" rx="14" fill="${BACKGROUND}"/>
${cells}
  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${MARK.radius}" fill="${AXIS}" opacity="0.25"/>
  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${MARK.radius}" fill="none" stroke="${AXIS}" stroke-width="3.5"/>
</svg>
`

writeFileSync('public/favicon.svg', svg)
console.log(`-> public/favicon.svg (${MARK.cells.length} cases)`)
