import { describeFailure, describeRefIssues } from '@/lib/messages'

describe('describeFailure', () => {
  it('demande les deux saisies quand il en manque une', () => {
    expect(describeFailure({ kind: 'vide' })).toContain('solution')
  })

  it('donne les deux nombres à comparer', () => {
    expect(describeFailure({ kind: 'compte', words: 5, letters: 7 })).toBe(
      '5 mots pour 7 lettres : il en faut autant de chaque, une ligne par lettre.',
    )
  })

  it('accorde le singulier', () => {
    expect(describeFailure({ kind: 'compte', words: 1, letters: 2 })).toContain('1 mot pour')
    expect(describeFailure({ kind: 'lettres', letters: ['T'] })).toBe(
      'Aucun mot ne contient la lettre T.',
    )
    expect(describeFailure({ kind: 'mots', words: ['bouquin'] })).toBe(
      'bouquin ne contient aucune lettre de la solution.',
    )
  })

  it('énumère à la française', () => {
    expect(describeFailure({ kind: 'lettres', letters: ['K', 'W', 'Z'] })).toBe(
      'Aucun mot ne contient les lettres K, W et Z.',
    )
    expect(describeFailure({ kind: 'mots', words: ['ski', 'wagon'] })).toBe(
      'ski et wagon ne contiennent aucune lettre de la solution.',
    )
  })

  it('explique le conflit par le nombre de lignes en cause', () => {
    expect(describeFailure({ kind: 'conflit', rows: 2, letters: ['E'], words: ['tarte'] })).toBe(
      '2 lignes se partagent trop peu de mots : E ne se trouve que dans tarte.',
    )

    expect(
      describeFailure({ kind: 'conflit', rows: 3, letters: ['E', 'T'], words: ['tarte', 'trot'] }),
    ).toBe('3 lignes se partagent trop peu de mots : E et T ne se trouvent que dans tarte et trot.')
  })
})

describe('describeRefIssues', () => {
  it('se tait quand tout va bien', () => {
    expect(describeRefIssues({ missing: [], duplicated: [] })).toBeNull()
  })

  it('montre la syntaxe attendue sur le premier mot en défaut', () => {
    expect(describeRefIssues({ missing: ['chat'], duplicated: [] })).toBe(
      'Chat est sans référence (écris « A1 chat »).',
    )
  })

  it('accorde le pluriel des mots sans référence', () => {
    expect(describeRefIssues({ missing: ['chat', 'chien'], duplicated: [] })).toBe(
      'Chat et chien sont sans référence (écris « A1 chat »).',
    )
  })

  it('signale un code servant à plusieurs mots', () => {
    expect(describeRefIssues({ missing: [], duplicated: ['A1'] })).toBe(
      'La référence A1 sert à plusieurs mots.',
    )
    expect(describeRefIssues({ missing: [], duplicated: ['A1', 'B2'] })).toBe(
      'Les références A1 et B2 servent chacune à plusieurs mots.',
    )
  })

  it('cumule les deux reproches', () => {
    expect(describeRefIssues({ missing: ['chat'], duplicated: ['A1'] })).toBe(
      'Chat est sans référence (écris « A1 chat »), et la référence A1 sert à plusieurs mots.',
    )
  })
})
