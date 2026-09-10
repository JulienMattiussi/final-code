/**
 * Couplage biparti entre les lignes de la grille et les mots de la liste.
 *
 * Poser les mots n'est pas un tri : un mot ne peut aller sur une ligne que s'il
 * porte la lettre de cette ligne, et prendre à chaque fois le premier mot qui
 * convient échoue là où une solution existe (le premier mot pouvant être le seul
 * possible pour une ligne suivante). L'algorithme de Kuhn répare ces impasses en
 * déplaçant les mots déjà posés le long d'un chemin alternant.
 */

/** `candidates[row]` liste les index des mots acceptables pour cette ligne. */
export type Candidates = readonly (readonly number[])[]

/**
 * Un couplage de cardinal maximal. `wordOf[row]` vaut l'index du mot posé sur la
 * ligne, ou -1 si elle est restée vide.
 */
export function maximumMatching(candidates: Candidates, wordCount: number): number[] {
  const rowOf = new Array<number>(wordCount).fill(-1)

  for (let row = 0; row < candidates.length; row++) {
    augment(row, candidates, rowOf, new Array<boolean>(wordCount).fill(false))
  }

  const wordOf = new Array<number>(candidates.length).fill(-1)
  for (let word = 0; word < wordCount; word++) {
    const row = rowOf[word]!
    if (row >= 0) wordOf[row] = word
  }
  return wordOf
}

function augment(row: number, candidates: Candidates, rowOf: number[], seen: boolean[]): boolean {
  for (const word of candidates[row]!) {
    if (seen[word]) continue
    seen[word] = true

    const holder = rowOf[word]!
    if (holder === -1 || augment(holder, candidates, rowOf, seen)) {
      rowOf[word] = row
      return true
    }
  }
  return false
}

/**
 * Un groupe de lignes qui se disputent trop peu de mots, à partir d'un couplage
 * maximal incomplet.
 *
 * C'est ce qui permet de dire pourquoi la grille est impossible plutôt que de
 * l'annoncer sans raison : en remontant les chemins alternants depuis une ligne
 * restée vide, on atteint des lignes dont les mots possibles sont tous déjà pris
 * par les autres lignes atteintes. Le groupe obtenu compte donc toujours une
 * ligne de plus que de mots : c'est exactement ce qu'interdit le théorème de Hall.
 */
export function hallWitness(
  candidates: Candidates,
  wordCount: number,
  wordOf: readonly number[],
): { rows: number[]; words: number[] } {
  const rowOf = new Array<number>(wordCount).fill(-1)
  wordOf.forEach((word, row) => {
    if (word >= 0) rowOf[word] = row
  })

  const start = wordOf.indexOf(-1)
  if (start === -1) return { rows: [], words: [] }

  const rows = new Set<number>([start])
  const words = new Set<number>()
  const queue = [start]

  while (queue.length > 0) {
    for (const word of candidates[queue.pop()!]!) {
      if (words.has(word)) continue
      words.add(word)
      const holder = rowOf[word]!
      if (holder >= 0 && !rows.has(holder)) {
        rows.add(holder)
        queue.push(holder)
      }
    }
  }

  return { rows: [...rows].sort(compare), words: [...words].sort(compare) }
}

function compare(a: number, b: number): number {
  return a - b
}
