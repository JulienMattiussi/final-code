/**
 * Régénère `public/og.png`, l'image que les réseaux sociaux affichent.
 *
 * Ce n'est pas une maquette : la feuille est une **vraie grille**, résolue par le
 * moteur et rendue par `svg.ts`, celui de l'aperçu. Une image dessinée à la main
 * finirait par promettre autre chose que ce que le produit fait, et personne ne
 * s'en apercevrait avant longtemps.
 *
 * La grille est montrée **remplie** : c'est la version qui explique le principe
 * sans une ligne de texte, puisqu'on y lit la phrase dans la colonne.
 *
 *   make og      (nécessite google-chrome pour la rastérisation)
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { MARK, plainCells } from '@/lib/logo'
import { parseWords } from '@/lib/normalize'
import { solve } from '@/lib/solve'
import { PALETTE } from '@/lib/style'
import { renderSheet } from '@/lib/svg'

/** Le format imposé par les réseaux sociaux, en pixels. */
const WIDTH = 1200
const HEIGHT = 630

const BACKGROUND = PALETTE.ink
const TITLE = '#f8fafc'
const ACCENT = '#38bdf8'
const MUTED = '#94a3b8'

const SANS = 'Helvetica, Nimbus Sans, Arial, sans-serif'

/** La feuille garde ses proportions A4 : c'est ce qui la fait lire comme du papier. */
const SHEET = { x: 762, y: 50, height: 530, width: (530 * 210) / 297 }

const LIST = [
  'A1 voile',
  'A2 mousse',
  'A3 gouvernail',
  'A4 rhum',
  'A5 hamac',
  'A6 galion',
  'K1 cordage',
  'K2 boussole',
  'K3 sabre',
  'K4 pirate',
  'K5 vigie',
  'K6 tresor',
].join('\n')

const result = solve(parseWords(LIST), 'le grand large')
if (!result.ok) throw new Error(`grille impossible : ${result.failure.kind}`)

const sheet = renderSheet(result.grid, {
  title: 'Chasse au trésor',
  note: 'Écris le mot de chaque code dans sa ligne.',
  solution: true,
})
  .replace(/^<svg[^>]*>\n?/, '')
  .replace(/<\/svg>\s*$/, '')

const mark = [
  ...plainCells().map(
    (cell) =>
      `<rect x="${cell.x}" y="${cell.y}" width="${MARK.cell}" height="${MARK.cell}"` +
      ` rx="${MARK.radius}" fill="none" stroke="${MUTED}" stroke-width="3"/>`,
  ),
  `<rect x="${MARK.axis.x}" y="${MARK.axis.y}" width="${MARK.axis.width}"` +
    ` height="${MARK.axis.height}" rx="${MARK.radius}" fill="${ACCENT}" opacity="0.25"/>`,
  `<rect x="${MARK.axis.x}" y="${MARK.axis.y}" width="${MARK.axis.width}"` +
    ` height="${MARK.axis.height}" rx="${MARK.radius}" fill="none" stroke="${ACCENT}" stroke-width="3.5"/>`,
].join('\n    ')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BACKGROUND}"/>

  <g transform="translate(80 88) scale(1.15)">
    ${mark}
  </g>

  <g font-family="${SANS}">
    <text x="80" y="248" font-size="64" font-weight="700" fill="${TITLE}">final-code</text>
    <text x="80" y="304" font-size="27" fill="${ACCENT}">Une grille de mots à imprimer</text>
    <text x="80" y="368" font-size="23" fill="${MUTED}">Les mots se placent tout seuls pour qu&apos;une colonne</text>
    <text x="80" y="402" font-size="23" fill="${MUTED}">verticale épelle le mot, ou la phrase, à trouver.</text>
    <text x="80" y="466" font-size="23" fill="${MUTED}">Chaque ligne porte son code : A1, K3, ...</text>
    <text x="80" y="546" font-size="21" fill="${ACCENT}">github.com/JulienMattiussi/final-code</text>
  </g>

  <svg x="${SHEET.x}" y="${SHEET.y}" width="${round(SHEET.width)}" height="${SHEET.height}" viewBox="0 0 210 297">
${sheet}
  </svg>
</svg>
`

function round(value: number): number {
  return Math.round(value * 100) / 100
}

mkdirSync('out', { recursive: true })
writeFileSync('out/og.svg', svg)

execFileSync('google-chrome', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--hide-scrollbars',
  `--window-size=${WIDTH},${HEIGHT}`,
  '--screenshot=public/og.png',
  `file://${process.cwd()}/out/og.svg`,
])

console.log(
  `-> public/og.png (${WIDTH}x${HEIGHT}, grille de ${result.grid.rows.length} lignes` +
    ` sur ${result.grid.columns} colonnes)`,
)
