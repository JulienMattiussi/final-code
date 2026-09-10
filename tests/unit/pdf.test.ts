import { parseWords } from '@/lib/normalize'
import { renderPdf } from '@/lib/pdf'
import { solve } from '@/lib/solve'
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

function textOf(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes)
}

describe('renderPdf', () => {
  it('écrit une page A4 portrait, au dixième de point', () => {
    const pdf = textOf(renderPdf(grid, OPTIONS))

    expect(pdf.startsWith('%PDF-1.4')).toBe(true)
    expect(pdf).toContain('/MediaBox [0 0 595.28 841.89]')
    expect(pdf).toContain('/Count 1')
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true)
  })

  it('n’embarque aucune police', () => {
    const pdf = textOf(renderPdf(grid, OPTIONS))

    expect(pdf).toContain('/BaseFont /Helvetica /Encoding /WinAnsiEncoding')
    expect(pdf).toContain('/BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding')
    expect(pdf).not.toContain('/FontFile')
  })

  /**
   * Le vrai risque du format : une table `xref` fausse rend le fichier illisible
   * dans certains lecteurs et parfaitement lisible dans d'autres. On relit donc
   * les décalages annoncés pour vérifier qu'ils tombent bien sur leur objet.
   */
  it('annonce des décalages exacts dans la table xref', () => {
    const pdf = textOf(renderPdf(grid, { ...OPTIONS, solution: true }))

    const start = Number(/startxref\n(\d+)/.exec(pdf)![1])
    expect(pdf.slice(start, start + 4)).toBe('xref')

    const entries = [...pdf.slice(start).matchAll(/^(\d{10}) 00000 n $/gm)].map((match) =>
      Number(match[1]),
    )
    expect(entries).toHaveLength(7)
    entries.forEach((offset, index) => {
      expect(pdf.slice(offset, offset + `${index + 1} 0 obj`.length)).toBe(`${index + 1} 0 obj`)
    })
  })

  it('déclare la longueur exacte du flux', () => {
    const pdf = textOf(renderPdf(grid, OPTIONS))

    const length = Number(/\/Length (\d+)/.exec(pdf)![1])
    const stream = /stream\n([\s\S]*?)\nendstream/.exec(pdf)![1]!
    expect(stream).toHaveLength(length)
  })

  it('n’écrit qu’un octet par caractère, accents compris', () => {
    const bytes = renderPdf(grid, OPTIONS)

    expect(bytes.every((byte) => byte <= 0xff)).toBe(true)
    // « é » et « — » sortent en octal, sans quoi tous les décalages glisseraient.
    expect(textOf(bytes)).toContain('Chasse au tr\\351sor')
  })

  it('laisse les cases vides sans le mode solution', () => {
    const empty = textOf(renderPdf(grid, OPTIONS))
    const filled = textOf(renderPdf(grid, { ...OPTIONS, solution: true }))

    expect(empty).not.toContain('(M) Tj')
    expect(filled).toContain('(M) Tj')
    expect(filled.length).toBeGreaterThan(empty.length)
  })

  it('écrit la référence de chaque ligne', () => {
    const pdf = textOf(renderPdf(grid, OPTIONS))

    expect(pdf).toContain('(A1) Tj')
    expect(pdf).toContain('(K7) Tj')
  })

  it('trace une case par lettre et un cadre par mot de la solution', () => {
    const phrase = gridFor('A1 soleil\nA2 astre\nA3 lune\nA4 nuage\nA5 nuit\nA6 etoile', 'la nuit')
    const pdf = textOf(renderPdf(phrase, OPTIONS))
    const cases = phrase.rows.reduce((total, row) => total + row.word.letters.length, 0)

    expect((pdf.match(/\nB\n/g) ?? []).length).toBe(cases)
    expect((pdf.match(/\nS\n/g) ?? []).length).toBe(phrase.groups.length)
  })
})
