import { parseWords } from '@/lib/normalize'
import { solve } from '@/lib/solve'
import { renderSheet } from '@/lib/svg'
import type { Grid, SheetOptions } from '@/lib/types'

function gridFor(list: string, solution: string): Grid {
  const result = solve(parseWords(list), solution)
  if (!result.ok) throw new Error(`grille impossible : ${result.failure.kind}`)
  return result.grid
}

const OPTIONS: SheetOptions = {
  title: 'Chasse au trésor',
  note: 'Écris chaque mot dans sa ligne.',
  solution: false,
}

const grid = gridFor('A1 crabe\nA2 mouette\nK7 sable', 'mer')

describe('renderSheet', () => {
  it('rend une page A4 portrait', () => {
    const svg = renderSheet(grid, OPTIONS)

    expect(svg).toContain('viewBox="0 0 210 297"')
    expect(svg).toContain('width="210mm" height="297mm"')
  })

  it('dessine une case par lettre, plus le cadre de la colonne solution', () => {
    const cases = grid.rows.reduce((total, row) => total + row.word.letters.length, 0)
    const rects = renderSheet(grid, OPTIONS).match(/<rect /g) ?? []

    // Le fond de page et le cadre de la colonne s'ajoutent aux cases.
    expect(rects).toHaveLength(cases + 2)
  })

  it('écrit devant chaque ligne la référence saisie pour son mot', () => {
    const svg = renderSheet(grid, OPTIONS)

    expect(svg).toContain('>A1</text>')
    expect(svg).toContain('>A2</text>')
    expect(svg).toContain('>K7</text>')
  })

  it('n’écrit rien devant une ligne dont le mot n’a pas de référence', () => {
    const nameless = gridFor('crabe\nmouette\nsable', 'mer')
    const svg = renderSheet(nameless, OPTIONS)

    expect(svg).not.toContain('text-anchor="end"')
  })

  it('laisse les cases vides tant qu’on ne demande pas la solution', () => {
    const svg = renderSheet(grid, OPTIONS)

    expect(svg).not.toContain('>M</text>')
    expect(svg).not.toContain('>S</text>')
  })

  it('écrit les mots quand on demande la solution', () => {
    const svg = renderSheet(grid, { ...OPTIONS, solution: true })
    const letters = grid.rows.reduce((total, row) => total + row.word.letters.length, 0)

    expect(svg.match(/font-size="[\d.]+" fill="#0f172a">[A-Z]<\/text>/g) ?? []).toHaveLength(
      letters,
    )
  })

  it('omet le titre et la consigne quand ils sont vides', () => {
    const svg = renderSheet(grid, { ...OPTIONS, title: '', note: '' })

    expect(svg).not.toContain('Chasse au trésor')
    expect(svg).toContain('<title>Grille de mots</title>')
  })

  it('échappe le texte saisi', () => {
    const svg = renderSheet(grid, { ...OPTIONS, title: 'Thé & <b>café</b>' })

    expect(svg).toContain('Thé &amp; &lt;b&gt;café&lt;/b&gt;')
    expect(svg).not.toContain('<b>')
  })

  it('encadre la colonne solution une fois par mot de la solution', () => {
    const phrase = gridFor('A1 soleil\nA2 astre\nA3 lune\nA4 nuage\nA5 nuit\nA6 etoile', 'la nuit')
    const frames = (svg: string): number => (svg.match(/stroke="#0284c7"/g) ?? []).length

    expect(phrase.groups).toEqual([2, 4])
    expect(frames(renderSheet(phrase, OPTIONS))).toBe(2)
    expect(frames(renderSheet(grid, OPTIONS))).toBe(1)
  })

  it('ouvre un blanc entre les lignes de deux mots de la solution', () => {
    const phrase = gridFor('A1 soleil\nA2 astre\nA3 lune\nA4 nuage\nA5 nuit\nA6 etoile', 'la nuit')
    const tops = [...renderSheet(phrase, OPTIONS).matchAll(/<rect x="[\d.]+" y="([\d.]+)"/g)].map(
      (match) => Number(match[1]),
    )
    const rows = [...new Set(tops)].sort((a, b) => a - b)

    // Deux mots de solution : le saut entre le premier groupe et le second est
    // plus grand qu'entre deux lignes du même groupe.
    expect(rows[1]! - rows[0]!).toBeLessThan(rows[2]! - rows[1]!)
  })

  it('produit un document analysable', () => {
    const document = new DOMParser().parseFromString(renderSheet(grid, OPTIONS), 'image/svg+xml')

    expect(document.querySelector('parsererror')).toBeNull()
    expect(document.documentElement.tagName).toBe('svg')
  })
})
