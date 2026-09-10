import { parseWords } from '@/lib/normalize'
import { solve } from '@/lib/solve'
import type { Grid, Word } from '@/lib/types'

function gridFor(list: string, solution: string): Grid {
  const result = solve(parseWords(list), solution)
  if (!result.ok) throw new Error(`grille impossible : ${result.failure.kind}`)
  return result.grid
}

/** Les invariants d'une grille : chaque mot posé une fois, sur sa lettre, sans déborder. */
function expectSound(grid: Grid, words: Word[]): void {
  expect(grid.rows).toHaveLength(grid.solution.length)
  expect(grid.rows.map((row) => row.word.label).sort()).toEqual(words.map((w) => w.label).sort())

  grid.rows.forEach((row, index) => {
    expect(row.word.letters[row.hit]).toBe(grid.solution[index])
    expect(row.start + row.hit).toBe(grid.axis)
    expect(row.start).toBeGreaterThanOrEqual(0)
    expect(row.start + row.word.letters.length).toBeLessThanOrEqual(grid.columns)
  })

  // Aucune colonne vide sur les bords : il en resterait une, la grille ne serait
  // pas la plus étroite et la recherche l'aurait trouvée un tour plus tôt.
  expect(Math.min(...grid.rows.map((row) => row.start))).toBe(0)
  expect(Math.max(...grid.rows.map((row) => row.start + row.word.letters.length))).toBe(
    grid.columns,
  )
}

describe('solve', () => {
  it('change l’ordre des mots pour que chacun trouve sa lettre', () => {
    const words = parseWords('crabe\nmouette\nsable')
    const result = solve(words, 'mer')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.grid.rows.map((row) => row.word.label)).toEqual(['mouette', 'sable', 'crabe'])
    expectSound(result.grid, words)
  })

  it('lit la solution dans la colonne', () => {
    const grid = gridFor('crabe\nmouette\nsable', 'mer')
    const column = grid.rows.map((row) => row.word.letters[row.hit]).join('')

    expect(column).toBe('MER')
  })

  it('prend la grille la plus étroite', () => {
    // Le E de SABLE est en quatrième lettre et le M de MOUETTE en première : il
    // faut quatre colonnes à gauche de l'axe et six à droite, soit onze.
    const grid = gridFor('crabe\nmouette\nsable', 'mer')

    expect(grid.columns).toBe(11)
    expect(grid.axis).toBe(4)
  })

  it('choisit l’occurrence de la lettre qui resserre la grille', () => {
    // AB et BA portent leur A à deux places différentes : les poser tous deux sur
    // leur premier A donnerait une grille de quatre colonnes au lieu de trois.
    const grid = gridFor('ab\nba', 'aa')

    expect(grid.columns).toBe(3)
    expect(grid.rows.map((row) => `${row.word.letters} en ${row.start}`)).toEqual([
      'BA en 0',
      'AB en 1',
    ])
  })

  it('accepte une solution en plusieurs mots, sans ligne pour l’espace', () => {
    const list = 'soleil\nastre\nlune\nnuage\nnuit\netoile'
    const grid = gridFor(list, 'la nuit')

    expect(grid.solution).toBe('LANUIT')
    expect(grid.rows).toHaveLength(6)
    expectSound(grid, parseWords(list))
  })

  it('retient la coupure entre les mots de la solution', () => {
    expect(gridFor('soleil\nastre\nlune\nnuage\nnuit\netoile', 'la nuit').groups).toEqual([2, 4])
    expect(gridFor('crabe\nmouette\nsable', 'mer').groups).toEqual([3])
  })

  describe('quand aucune grille n’existe', () => {
    it('réclame les deux saisies quand l’une manque', () => {
      expect(solve([], 'chat')).toEqual({ ok: false, failure: { kind: 'vide' } })
      expect(solve(parseWords('chat'), '')).toEqual({ ok: false, failure: { kind: 'vide' } })
    })

    it('compare le nombre de mots au nombre de lettres', () => {
      const result = solve(parseWords('chat\nchien'), 'mer')

      expect(result).toEqual({ ok: false, failure: { kind: 'compte', words: 2, letters: 3 } })
    })

    it('nomme la lettre qu’aucun mot ne porte', () => {
      const result = solve(parseWords('chien\nmarche\nlapin\nsouris'), 'chat')

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.failure).toEqual({ kind: 'lettres', letters: ['T'] })
    })

    it('nomme le mot qui ne sert à rien', () => {
      const result = solve(parseWords('sable\nbouquin'), 'as')

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.failure).toEqual({ kind: 'mots', words: ['bouquin'] })
    })

    it('nomme les lignes qui se disputent le même mot', () => {
      const result = solve(parseWords('tarte\ntrot\ntoto'), 'ete')

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.failure).toEqual({
        kind: 'conflit',
        rows: 2,
        letters: ['E'],
        words: ['tarte'],
      })
    })
  })

  /**
   * La grille est construite à l'envers : on tire des mots au hasard, puis on
   * fabrique la solution en prenant une lettre dans chacun. Une grille existe donc
   * forcément, et l'ordre des mots donné au moteur n'est pas celui qui marche.
   */
  it('pose n’importe quelle liste qui admet une solution', () => {
    const random = generator(20260910)

    for (let round = 0; round < 200; round++) {
      const words = Array.from({ length: 2 + Math.floor(random() * 8) }, () =>
        Array.from({ length: 3 + Math.floor(random() * 8) }, () =>
          'ABCDE'.charAt(Math.floor(random() * 5)),
        ).join(''),
      )
      const solution = words.map((word) => word.charAt(Math.floor(random() * word.length))).join('')
      const shuffled = [...words].sort(() => random() - 0.5)
      const parsed = parseWords(shuffled.join('\n'))

      const result = solve(parsed, solution)

      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.grid.rows.map((row) => row.word.letters[row.hit]).join('')).toBe(solution)
      expectSound(result.grid, parsed)
    }
  })
})

/** Un tirage reproductible : un test qui échoue doit pouvoir être rejoué. */
function generator(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}
