import { gridUnits, layoutFor, MARGIN_MM, MIN_CELL_MM, PAGE, rowOffsets } from '@/lib/layout'
import { parseWords } from '@/lib/normalize'
import { solve } from '@/lib/solve'
import type { Grid } from '@/lib/types'

function gridFor(list: string, solution: string): Grid {
  const result = solve(parseWords(list), solution)
  if (!result.ok) throw new Error(`grille impossible : ${result.failure.kind}`)
  return result.grid
}

const BARE = { title: '', note: '' }
const FULL = { title: 'Chasse au trésor', note: 'Écris chaque mot dans sa ligne.' }

describe('layoutFor', () => {
  it('tient dans la page, marges comprises', () => {
    const grid = gridFor('crabe\nmouette\nsable', 'mer')
    const layout = layoutFor(grid, FULL)

    const left = layout.gridX - layout.labelMm
    const right = layout.gridX + grid.columns * layout.cellMm
    const bottom = layout.gridY + grid.rows.length * layout.cellMm

    expect(left).toBeGreaterThanOrEqual(MARGIN_MM)
    expect(right).toBeLessThanOrEqual(PAGE.widthMm - MARGIN_MM)
    expect(layout.gridY).toBeGreaterThanOrEqual(MARGIN_MM)
    expect(bottom).toBeLessThanOrEqual(PAGE.heightMm - MARGIN_MM)
  })

  it('centre la grille et sa colonne d’étiquettes', () => {
    const grid = gridFor('crabe\nmouette\nsable', 'mer')
    const layout = layoutFor(grid, BARE)

    const left = layout.gridX - layout.labelMm
    const right = layout.gridX + grid.columns * layout.cellMm

    expect(left - MARGIN_MM).toBeCloseTo(PAGE.widthMm - MARGIN_MM - right, 6)
  })

  it('ne réserve la place du titre que s’il y en a un', () => {
    const grid = gridFor('crabe\nmouette\nsable', 'mer')

    expect(layoutFor(grid, BARE).titleY).toBeNull()
    expect(layoutFor(grid, BARE).noteY).toBeNull()
    expect(layoutFor(grid, FULL).titleY).toBeGreaterThan(MARGIN_MM)
    expect(layoutFor(grid, FULL).noteY).toBeGreaterThan(layoutFor(grid, FULL).titleY!)
  })

  it('borne la case pour qu’une grille courte ne devienne pas une affiche', () => {
    const grid = gridFor('ab\nba', 'aa')

    expect(layoutFor(grid, BARE).cellMm).toBeLessThanOrEqual(14)
  })

  it('rétrécit la case quand la grille s’élargit', () => {
    const petite = layoutFor(gridFor('crabe\nmouette\nsable', 'mer'), BARE)
    const large = layoutFor(gridFor(LONG_LIST, 'anniversaire'), BARE)

    expect(large.cellMm).toBeLessThan(petite.cellMm)
    expect(large.cellMm).toBeGreaterThan(MIN_CELL_MM)
  })

  it('compte le blanc entre les mots de la solution dans la hauteur', () => {
    const phrase = gridFor(PHRASE_LIST, 'la nuit')
    const layout = layoutFor(phrase, BARE)
    const offsets = rowOffsets(phrase.groups)

    // Les deux premières lignes se touchent, la troisième ouvre le second mot.
    expect(offsets[1]! - offsets[0]!).toBe(1)
    expect(offsets[2]! - offsets[1]!).toBeGreaterThan(1)
    expect(gridUnits(phrase.groups)).toBeGreaterThan(phrase.rows.length)
    expect(layout.gridY + gridUnits(phrase.groups) * layout.cellMm).toBeLessThanOrEqual(
      PAGE.heightMm - MARGIN_MM,
    )
  })

  it('garde la grille dans la page même quand elle a beaucoup de lignes', () => {
    const grid = gridFor(LONG_LIST, 'anniversaire')
    const layout = layoutFor(grid, FULL)

    expect(layout.gridY + grid.rows.length * layout.cellMm).toBeLessThanOrEqual(
      PAGE.heightMm - MARGIN_MM,
    )
  })
})

const PHRASE_LIST = 'soleil\nastre\nlune\nnuage\nnuit\netoile'

const LONG_LIST = [
  'ballon',
  'gateau',
  'bougie',
  'cadeau',
  'confetti',
  'guirlande',
  'invitation',
  'surprise',
  'chapeau',
  'bonbon',
  'musique',
  'serpentin',
].join('\n')
