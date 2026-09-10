import { parseWords, toGroups, toLetters } from '@/lib/normalize'

describe('toLetters', () => {
  it('met en majuscules', () => {
    expect(toLetters('chat')).toBe('CHAT')
  })

  it('retire les accents sans perdre la lettre', () => {
    expect(toLetters('Élève')).toBe('ELEVE')
    expect(toLetters('Noël')).toBe('NOEL')
    expect(toLetters('Ça')).toBe('CA')
  })

  it('développe les ligatures', () => {
    expect(toLetters('cœur')).toBe('COEUR')
    expect(toLetters('œuf')).toBe('OEUF')
    expect(toLetters('nævus')).toBe('NAEVUS')
  })

  it('retire tout ce qui ne prend pas de case', () => {
    expect(toLetters("L'Hôtel-Dieu")).toBe('LHOTELDIEU')
    expect(toLetters('rue 32')).toBe('RUE')
  })

  it('rend une chaîne vide quand il ne reste aucune lettre', () => {
    expect(toLetters('   ...   ')).toBe('')
  })
})

describe('parseWords', () => {
  it('lit un mot par ligne', () => {
    expect(parseWords('chat\nchien')).toEqual([
      { ref: '', label: 'chat', letters: 'CHAT' },
      { ref: '', label: 'chien', letters: 'CHIEN' },
    ])
  })

  it('détache la référence du mot', () => {
    expect(parseWords('A1 chat')[0]).toEqual({ ref: 'A1', label: 'chat', letters: 'CHAT' })
  })

  it('accepte les séparateurs qu’on écrit spontanément', () => {
    const entries = parseWords('A1 chat\nA2: chien\nA3 - souris\nA4\tlapin\nA5;renard\nA6=belette')

    expect(entries.map((word) => word.ref)).toEqual(['A1', 'A2', 'A3', 'A4', 'A5', 'A6'])
    expect(entries.map((word) => word.label)).toEqual([
      'chat',
      'chien',
      'souris',
      'lapin',
      'renard',
      'belette',
    ])
  })

  it('accepte n’importe quel code contenant un chiffre', () => {
    expect(parseWords('12 chat\nZZ34 chien\nb7 souris').map((word) => word.ref)).toEqual([
      '12',
      'ZZ34',
      'b7',
    ])
  })

  /**
   * Le chiffre est ce qui évite de couper un mot en deux : sans lui, « chef
   * d'oeuvre » deviendrait la référence « chef » et le mot « d'oeuvre ».
   */
  it('ne prend pas le premier mot d’un nom composé pour une référence', () => {
    expect(parseWords("chef d'oeuvre")[0]).toEqual({
      ref: '',
      label: "chef d'oeuvre",
      letters: 'CHEFDOEUVRE',
    })
  })

  it('garde la saisie telle quelle comme étiquette', () => {
    expect(parseWords('  A1  Éléphant  ')[0]).toEqual({
      ref: 'A1',
      label: 'Éléphant',
      letters: 'ELEPHANT',
    })
  })

  it('ignore les lignes vides, celles sans lettre et les codes sans mot', () => {
    expect(parseWords('A1 chat\n\n   \n---\nA2\nA3 chien')).toHaveLength(2)
  })
})

describe('toGroups', () => {
  it('rend un groupe par mot de la solution', () => {
    expect(toGroups('la nuit')).toEqual(['LA', 'NUIT'])
  })

  it('rend un seul groupe pour un mot seul', () => {
    expect(toGroups('anniversaire')).toEqual(['ANNIVERSAIRE'])
  })

  it('ignore les espaces en trop et la ponctuation', () => {
    expect(toGroups('  chez   moi ! ')).toEqual(['CHEZ', 'MOI'])
  })

  it('ne coupe pas sur le trait d’union', () => {
    expect(toGroups('arc-en-ciel')).toEqual(['ARCENCIEL'])
  })

  it('ne rend rien quand il n’y a aucune lettre', () => {
    expect(toGroups('  ...  ')).toEqual([])
  })
})
