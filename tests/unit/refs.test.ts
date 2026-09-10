import { parseWords } from '@/lib/normalize'
import { refIssues } from '@/lib/refs'

describe('refIssues', () => {
  it('ne signale rien quand chaque mot a son code', () => {
    expect(refIssues(parseWords('A1 chat\nA2 chien'))).toEqual({ missing: [], duplicated: [] })
  })

  it('nomme les mots laissés sans code', () => {
    expect(refIssues(parseWords('A1 chat\nchien\nsouris')).missing).toEqual(['chien', 'souris'])
  })

  it('nomme les codes servant à plusieurs mots', () => {
    expect(refIssues(parseWords('A1 chat\nA1 chien\nA2 souris')).duplicated).toEqual(['A1'])
  })

  it('ne compte un code en double qu’une fois', () => {
    expect(refIssues(parseWords('A1 chat\nA1 chien\nA1 souris')).duplicated).toEqual(['A1'])
  })
})
