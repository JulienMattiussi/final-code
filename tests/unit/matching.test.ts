import { hallWitness, maximumMatching } from '@/lib/matching'

describe('maximumMatching', () => {
  it('pose chaque ligne sur un mot différent', () => {
    const wordOf = maximumMatching([[0, 1], [1]], 2)

    expect(wordOf).toEqual([0, 1])
  })

  /**
   * Le cas que l'algorithme existe pour résoudre : la première ligne prend le
   * mot 0 parce qu'il convient, mais c'est le seul de la deuxième ligne. Il faut
   * la déloger, ce qu'un simple parcours dans l'ordre ne fait pas.
   */
  it('déloge un mot déjà posé quand une ligne suivante n’a que lui', () => {
    const wordOf = maximumMatching([[0, 1], [0]], 2)

    expect(wordOf).toEqual([1, 0])
  })

  it('remonte plusieurs déplacements en chaîne', () => {
    const wordOf = maximumMatching([[0, 1, 2], [0, 1], [0]], 3)

    expect([...wordOf].sort()).toEqual([0, 1, 2])
  })

  it('laisse la ligne vide quand aucun mot ne lui convient', () => {
    expect(maximumMatching([[0], []], 1)).toEqual([0, -1])
  })

  it('ne pose jamais deux fois le même mot', () => {
    const wordOf = maximumMatching([[0], [0], [0]], 1)

    expect(wordOf.filter((word) => word === 0)).toHaveLength(1)
    expect(wordOf.filter((word) => word === -1)).toHaveLength(2)
  })
})

describe('hallWitness', () => {
  it('nomme les lignes qui se disputent trop peu de mots', () => {
    const candidates = [[0], [0], [1]]
    const witness = hallWitness(candidates, 2, maximumMatching(candidates, 2))

    expect(witness.rows).toEqual([0, 1])
    expect(witness.words).toEqual([0])
  })

  it('compte toujours une ligne de plus que de mots', () => {
    const candidates = [
      [0, 1],
      [0, 1],
      [0, 1],
    ]
    const witness = hallWitness(candidates, 2, maximumMatching(candidates, 2))

    expect(witness.rows).toHaveLength(witness.words.length + 1)
  })

  it('ne rend rien quand toutes les lignes sont servies', () => {
    const candidates = [[0], [1]]

    expect(hallWitness(candidates, 2, maximumMatching(candidates, 2))).toEqual({
      rows: [],
      words: [],
    })
  })
})
