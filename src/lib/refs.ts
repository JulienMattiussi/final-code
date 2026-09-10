import type { Word } from '@/lib/types'

/**
 * Ce qui empêche de retrouver un mot depuis son code. Ni l'un ni l'autre ne rend
 * la grille impossible, donc ce sont des avertissements et non des échecs : une
 * feuille se relit très bien avec un code manquant, mais on ne saura pas quoi
 * écrire sur cette ligne.
 */
export interface RefIssues {
  missing: string[]
  duplicated: string[]
}

export function refIssues(words: readonly Word[]): RefIssues {
  const seen = new Set<string>()
  const duplicated = new Set<string>()

  for (const word of words) {
    if (word.ref.length === 0) continue
    if (seen.has(word.ref)) duplicated.add(word.ref)
    seen.add(word.ref)
  }

  return {
    missing: words.filter((word) => word.ref.length === 0).map((word) => word.label),
    duplicated: [...duplicated],
  }
}
