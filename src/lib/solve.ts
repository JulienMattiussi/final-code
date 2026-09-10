import { hallWitness, maximumMatching, type Candidates } from '@/lib/matching'
import { toGroups } from '@/lib/normalize'
import type { Grid, Row, Word } from '@/lib/types'

/**
 * Construit la grille la plus étroite qui pose tous les mots sur la solution.
 *
 * Deux choix s'enchaînent et ne peuvent pas se décider l'un sans l'autre : quel
 * mot va sur quelle ligne, et quelle occurrence de la lettre tombe dans la
 * colonne solution quand le mot la porte plusieurs fois (BANANE peut donner son
 * A en deuxième ou en quatrième position, ce qui décale toute la ligne).
 *
 * D'où la forme de la recherche : on fixe un budget de colonnes à gauche et à
 * droite de la colonne solution, on ne garde que les occurrences qui y tiennent,
 * et on demande un couplage complet. Le premier budget qui passe donne la
 * largeur minimale, puisqu'on les essaie par largeur croissante.
 */

export type Failure =
  | { kind: 'vide' }
  | { kind: 'compte'; words: number; letters: number }
  | { kind: 'lettres'; letters: string[] }
  | { kind: 'mots'; words: string[] }
  | { kind: 'conflit'; rows: number; letters: string[]; words: string[] }

export type SolveResult = { ok: true; grid: Grid } | { ok: false; failure: Failure }

export function solve(words: readonly Word[], solution: string): SolveResult {
  const groups = toGroups(solution)
  const target = groups.join('')

  if (words.length === 0 || target.length === 0) return { ok: false, failure: { kind: 'vide' } }
  if (words.length !== target.length) {
    return { ok: false, failure: { kind: 'compte', words: words.length, letters: target.length } }
  }

  const placed = search(words, target, groups)
  return placed ?? { ok: false, failure: diagnose(words, target) }
}

/** Les positions de chaque lettre dans un mot, pour ne les chercher qu'une fois. */
function positionsOf(word: Word): Map<string, number[]> {
  const positions = new Map<string, number[]>()
  for (let index = 0; index < word.letters.length; index++) {
    const letter = word.letters[index]!
    const known = positions.get(letter)
    if (known) known.push(index)
    else positions.set(letter, [index])
  }
  return positions
}

function search(
  words: readonly Word[],
  target: string,
  groups: readonly string[],
): SolveResult | null {
  const positions = words.map(positionsOf)
  const longest = Math.max(...words.map((word) => word.letters.length))

  // Une ligne ne peut pas déborder de la grille, donc la largeur va de la longueur
  // du plus long mot (il tient d'un bord à l'autre) au double moins un (sa lettre
  // solution est au bout, et un autre mot pend entièrement de l'autre côté).
  for (let columns = longest; columns <= 2 * longest - 1; columns++) {
    for (const axis of axisOrder(columns)) {
      const candidates = within(words, target, positions, axis, columns - 1 - axis)
      const wordOf = maximumMatching(candidates, words.length)
      if (wordOf.includes(-1)) continue

      const rows = wordOf.map((word, row) =>
        place(words[word]!, positions[word]!.get(target[row]!)!, axis, columns),
      )
      return {
        ok: true,
        grid: {
          solution: target,
          groups: groups.map((group) => group.length),
          rows,
          columns,
          axis,
        },
      }
    }
  }

  return null
}

/**
 * Les colonnes solution possibles, de la plus centrée à la plus excentrée : à
 * largeur égale, une grille dont l'axe est au milieu est plus équilibrée sur la
 * feuille qu'un escalier qui pend d'un seul côté.
 */
function axisOrder(columns: number): number[] {
  const centre = (columns - 1) / 2
  return Array.from({ length: columns }, (_, axis) => axis).sort(
    (a, b) => Math.abs(a - centre) - Math.abs(b - centre) || a - b,
  )
}

function within(
  words: readonly Word[],
  target: string,
  positions: Map<string, number[]>[],
  axis: number,
  right: number,
): Candidates {
  return [...target].map((letter) =>
    words.reduce<number[]>((accepted, word, index) => {
      const fits = (positions[index]!.get(letter) ?? []).some(
        (at) => at <= axis && word.letters.length - 1 - at <= right,
      )
      if (fits) accepted.push(index)
      return accepted
    }, []),
  )
}

/**
 * Parmi les occurrences retenues, celle qui centre le mieux le mot dans la
 * grille : elles tiennent toutes dans le budget, donc autant prendre la plus
 * jolie plutôt que la première venue.
 */
function place(word: Word, occurrences: number[], axis: number, columns: number): Row {
  let best = occurrences[0]!
  let bestOffset = Infinity

  for (const hit of occurrences) {
    const start = axis - hit
    if (start < 0 || start + word.letters.length > columns) continue

    const offset = Math.abs(start + word.letters.length / 2 - columns / 2)
    if (offset < bestOffset) {
      best = hit
      bestOffset = offset
    }
  }

  return { word, hit: best, start: axis - best }
}

/**
 * Pourquoi aucune grille n'existe. Les deux causes simples sont annoncées en
 * premier parce qu'elles se corrigent d'elles-mêmes une fois lues ; le conflit
 * n'arrive qu'en dernier, quand chaque mot et chaque lettre pris isolément
 * semblent pourtant plaçables.
 */
function diagnose(words: readonly Word[], target: string): Failure {
  const missing = [...new Set(target)].filter(
    (letter) => !words.some((word) => word.letters.includes(letter)),
  )
  if (missing.length > 0) return { kind: 'lettres', letters: missing }

  const idle = words.filter((word) => ![...target].some((letter) => word.letters.includes(letter)))
  if (idle.length > 0) return { kind: 'mots', words: idle.map((word) => word.label) }

  const candidates = [...target].map((letter) =>
    words.reduce<number[]>((accepted, word, index) => {
      if (word.letters.includes(letter)) accepted.push(index)
      return accepted
    }, []),
  )
  const witness = hallWitness(candidates, words.length, maximumMatching(candidates, words.length))

  return {
    kind: 'conflit',
    rows: witness.rows.length,
    letters: [...new Set(witness.rows.map((row) => target[row]!))],
    words: witness.words.map((word) => words[word]!.label),
  }
}
