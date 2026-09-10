/**
 * Régénère `src/lib/fonts.ts` à partir des fichiers AFM d'URW base35.
 *
 * Pourquoi une table plutôt que `canvas.measureText` : la feuille doit être le
 * même dessin dans le navigateur et dans le PDF exporté. Une mesure prise au
 * canvas dépend de la police réellement installée sur le poste, donc l'aperçu et
 * le PDF divergeraient. La table est figée, elle est la seule source.
 *
 * Les deux familles retenues sont Helvetica et son gras, deux des quatorze
 * polices que tout lecteur PDF possède, donc rien à embarquer à l'export. URW
 * base35 en est le clone métrique officiel : les largeurs sont identiques au
 * millième d'em près.
 *
 *   make afm
 */
import { readFileSync, writeFileSync } from 'node:fs'

const AFM_DIR = process.env.AFM_DIR ?? '/usr/share/fonts/type1/urw-base35'

/** Nom PostScript écrit dans le PDF, et son clone métrique URW pour la mesure. */
const FAMILIES = [
  { key: 'HELVETICA', postscript: 'Helvetica', afm: 'NimbusSans-Regular.afm' },
  { key: 'HELVETICA_BOLD', postscript: 'Helvetica-Bold', afm: 'NimbusSans-Bold.afm' },
]

/** Noms de glyphes AFM pour les codes ASCII 32 à 126, dans l'ordre. */
// prettier-ignore
const ASCII_NAMES = [
  'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand',
  'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen',
  'period', 'slash', 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater', 'question', 'at',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
  'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash',
  'bracketright', 'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
  'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde',
]

/**
 * Au-delà de l'ASCII, on couvre ce que WinAnsiEncoding sait coder : c'est
 * exactement le jeu que le PDF pourra écrire sans embarquer de police. Le
 * français y tient en entier, guillemets et apostrophe typographique compris.
 */
// prettier-ignore
const EXTRA_NAMES: Record<number, string> = {
  0x20ac: 'Euro', 0x201a: 'quotesinglbase', 0x0192: 'florin', 0x201e: 'quotedblbase',
  0x2026: 'ellipsis', 0x2020: 'dagger', 0x2021: 'daggerdbl', 0x02c6: 'circumflex',
  0x2030: 'perthousand', 0x0160: 'Scaron', 0x2039: 'guilsinglleft', 0x0152: 'OE',
  0x017d: 'Zcaron', 0x2018: 'quoteleft', 0x2019: 'quoteright', 0x201c: 'quotedblleft',
  0x201d: 'quotedblright', 0x2022: 'bullet', 0x2013: 'endash', 0x2014: 'emdash',
  0x02dc: 'tilde', 0x2122: 'trademark', 0x0161: 'scaron', 0x203a: 'guilsinglright',
  0x0153: 'oe', 0x017e: 'zcaron', 0x0178: 'Ydieresis',
  0x00a0: 'space', 0x00a1: 'exclamdown', 0x00a2: 'cent', 0x00a3: 'sterling',
  0x00a4: 'currency', 0x00a5: 'yen', 0x00a6: 'brokenbar', 0x00a7: 'section',
  0x00a8: 'dieresis', 0x00a9: 'copyright', 0x00aa: 'ordfeminine',
  0x00ab: 'guillemotleft', 0x00ac: 'logicalnot', 0x00ad: 'hyphen', 0x00ae: 'registered',
  0x00af: 'macron', 0x00b0: 'degree', 0x00b1: 'plusminus', 0x00b2: 'twosuperior',
  0x00b3: 'threesuperior', 0x00b4: 'acute', 0x00b5: 'mu', 0x00b6: 'paragraph',
  0x00b7: 'periodcentered', 0x00b8: 'cedilla', 0x00b9: 'onesuperior',
  0x00ba: 'ordmasculine', 0x00bb: 'guillemotright', 0x00bc: 'onequarter',
  0x00bd: 'onehalf', 0x00be: 'threequarters', 0x00bf: 'questiondown',
  0x00c0: 'Agrave', 0x00c1: 'Aacute', 0x00c2: 'Acircumflex', 0x00c3: 'Atilde',
  0x00c4: 'Adieresis', 0x00c5: 'Aring', 0x00c6: 'AE', 0x00c7: 'Ccedilla',
  0x00c8: 'Egrave', 0x00c9: 'Eacute', 0x00ca: 'Ecircumflex', 0x00cb: 'Edieresis',
  0x00cc: 'Igrave', 0x00cd: 'Iacute', 0x00ce: 'Icircumflex', 0x00cf: 'Idieresis',
  0x00d0: 'Eth', 0x00d1: 'Ntilde', 0x00d2: 'Ograve', 0x00d3: 'Oacute',
  0x00d4: 'Ocircumflex', 0x00d5: 'Otilde', 0x00d6: 'Odieresis', 0x00d7: 'multiply',
  0x00d8: 'Oslash', 0x00d9: 'Ugrave', 0x00da: 'Uacute', 0x00db: 'Ucircumflex',
  0x00dc: 'Udieresis', 0x00dd: 'Yacute', 0x00de: 'Thorn', 0x00df: 'germandbls',
  0x00e0: 'agrave', 0x00e1: 'aacute', 0x00e2: 'acircumflex', 0x00e3: 'atilde',
  0x00e4: 'adieresis', 0x00e5: 'aring', 0x00e6: 'ae', 0x00e7: 'ccedilla',
  0x00e8: 'egrave', 0x00e9: 'eacute', 0x00ea: 'ecircumflex', 0x00eb: 'edieresis',
  0x00ec: 'igrave', 0x00ed: 'iacute', 0x00ee: 'icircumflex', 0x00ef: 'idieresis',
  0x00f0: 'eth', 0x00f1: 'ntilde', 0x00f2: 'ograve', 0x00f3: 'oacute',
  0x00f4: 'ocircumflex', 0x00f5: 'otilde', 0x00f6: 'odieresis', 0x00f7: 'divide',
  0x00f8: 'oslash', 0x00f9: 'ugrave', 0x00fa: 'uacute', 0x00fb: 'ucircumflex',
  0x00fc: 'udieresis', 0x00fd: 'yacute', 0x00fe: 'thorn', 0x00ff: 'ydieresis',
}

interface Afm {
  widths: Map<string, number>
  capHeight: number
}

function parseAfm(path: string): Afm {
  const widths = new Map<string, number>()
  let capHeight = 0

  for (const line of readFileSync(path, 'latin1').split('\n')) {
    const metric = /^C\s+-?\d+\s*;\s*WX\s+(-?\d+)\s*;\s*N\s+(\S+)\s*;/.exec(line)
    if (metric) {
      widths.set(metric[2]!, Number(metric[1]))
      continue
    }
    const field = /^CapHeight\s+(-?\d+)/.exec(line)
    if (field) capHeight = Number(field[1])
  }

  if (widths.size === 0) throw new Error(`Aucune métrique lue dans ${path}`)
  return { widths, capHeight }
}

function codepoints(): number[] {
  const points: number[] = []
  for (let code = 32; code <= 126; code++) points.push(code)
  points.push(...Object.keys(EXTRA_NAMES).map(Number))
  return points.sort((a, b) => a - b)
}

function glyphName(code: number): string {
  return code >= 32 && code <= 126 ? ASCII_NAMES[code - 32]! : EXTRA_NAMES[code]!
}

/** Écrit `{ 32: 278, 33: 278, ... }` sur plusieurs lignes, lisible en diff. */
function formatWidths(entries: [number, number][]): string {
  const lines: string[] = []
  for (let i = 0; i < entries.length; i += 8) {
    const chunk = entries.slice(i, i + 8).map(([code, width]) => `${code}: ${width}`)
    lines.push(`    ${chunk.join(', ')},`)
  }
  return lines.join('\n')
}

function main(): void {
  const points = codepoints()
  const blocks: string[] = []

  for (const family of FAMILIES) {
    const afm = parseAfm(`${AFM_DIR}/${family.afm}`)
    const entries: [number, number][] = []
    const missing: string[] = []

    for (const code of points) {
      const name = glyphName(code)
      const width = afm.widths.get(name)
      if (width === undefined) missing.push(name)
      else entries.push([code, width])
    }

    if (missing.length > 0) {
      console.warn(`${family.postscript} : glyphes absents -> ${missing.join(', ')}`)
    }

    // `space` est la largeur de repli la plus sûre : un caractère non couvert
    // avance d'un blanc plutôt que de zéro, ce qui superposerait le suivant.
    const fallback = afm.widths.get('space')!

    blocks.push(`export const ${family.key}: FontMetrics = {
  postscript: '${family.postscript}',
  capHeight: ${afm.capHeight},
  fallback: ${fallback},
  widths: {
${formatWidths(entries)}
  },
}`)

    console.log(`${family.postscript} : ${entries.length} glyphes`)
  }

  const source = `/**
 * Largeurs de glyphes, en millièmes d'em, d'Helvetica et de son gras.
 * **Fichier généré par \`make afm\`, ne pas éditer à la main.**
 *
 * C'est la seule source des mesures de texte du projet : l'aperçu et l'export
 * PDF s'y réfèrent tous les deux, donc ils ne peuvent pas diverger. Le jeu de
 * caractères couvert est celui de WinAnsiEncoding, que le PDF sait écrire sans
 * embarquer de police.
 */

export interface FontMetrics {
  /** Nom PostScript à écrire dans le PDF. */
  postscript: string
  /** Hauteur des capitales, en millièmes d'em : de quoi centrer une lettre. */
  capHeight: number
  /** Largeur retenue pour un caractère absent de la table. */
  fallback: number
  /** Largeur d'avance par point de code. */
  widths: Record<number, number>
}

${blocks.join('\n\n')}
`

  writeFileSync('src/lib/fonts.ts', source)
  console.log('-> src/lib/fonts.ts')
}

main()
