import type { Word } from '@/lib/types'

/**
 * Une case porte une lettre de A à Z, donc la grille ignore la casse, les accents
 * et tout ce qui n'est pas une lettre : « L'HÔTEL-DIEU » occupe dix cases.
 */

/**
 * Les ligatures ne se décomposent pas en NFD et ne remontent pas en A-Z par
 * `toUpperCase` : sans cette table, « COEUR » saisi avec la ligature perdrait sa
 * deuxième case.
 */
const EXPANSIONS: Record<string, string> = {
  Œ: 'OE',
  œ: 'OE',
  Æ: 'AE',
  æ: 'AE',
}

const COMBINING_MARKS = /\p{M}/gu

export function toLetters(text: string): string {
  return text
    .replace(/[ŒœÆæ]/g, (char) => EXPANSIONS[char] ?? char)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}

/**
 * Les lettres de la solution, groupées par mot. Un espace ne prend pas de case,
 * mais il ne disparaît pas pour autant : c'est lui qui détache les groupes de
 * lignes sur la feuille, sans quoi une phrase se lirait d'un seul bloc.
 */
export function toGroups(text: string): string[] {
  return text
    .split(/\s+/)
    .map(toLetters)
    .filter((group) => group.length > 0)
}

/**
 * La référence se reconnaît à son chiffre : c'est ce qui distingue « A1 chat »,
 * un code suivi de son mot, de « chef d'oeuvre », un mot en deux morceaux. Un
 * séparateur est exigé entre les deux, sans quoi « A1chat » se couperait
 * n'importe où.
 */
const ENTRY = /^([A-Za-z0-9]*\d[A-Za-z0-9]*)[\s:;=,.|/-]+(.+)$/

/** Une référence seule, sans son mot : une ligne encore à finir de taper. */
const BARE_REF = /^[A-Za-z0-9]*\d[A-Za-z0-9]*$/

/** Une ligne par mot : les autres signes servent à détacher la référence. */
export function parseWords(text: string): Word[] {
  return text
    .split('\n')
    .map((line) => entryOf(line.trim()))
    .filter((word) => word.letters.length > 0)
}

function entryOf(line: string): Word {
  const match = ENTRY.exec(line)
  if (!match) {
    const bare = BARE_REF.test(line)
    return { ref: bare ? line : '', label: line, letters: bare ? '' : toLetters(line) }
  }

  const label = match[2]!.trim()
  return { ref: match[1]!, label, letters: toLetters(label) }
}
