import { HELVETICA, HELVETICA_BOLD } from '@/lib/fonts'

/**
 * La table est générée par `make afm`, donc ces tests ne vérifient pas un calcul
 * mais une régénération : quelques largeurs de référence, connues d'Adobe, qui
 * cassent si le générateur se trompe de famille ou décale l'encodage.
 */
describe('les métriques Helvetica', () => {
  it('donne les largeurs de référence, en millièmes d’em', () => {
    expect(HELVETICA.widths[32]).toBe(278)
    expect(HELVETICA.widths[65]).toBe(667)
    expect(HELVETICA_BOLD.widths[65]).toBe(722)
  })

  it('couvre les accents et l’euro, que WinAnsiEncoding sait écrire', () => {
    expect(HELVETICA.widths['é'.codePointAt(0)!]).toBe(556)
    expect(HELVETICA.widths['€'.codePointAt(0)!]).toBe(556)
  })

  it('nomme les polices telles que le PDF les attend', () => {
    expect(HELVETICA.postscript).toBe('Helvetica')
    expect(HELVETICA_BOLD.postscript).toBe('Helvetica-Bold')
  })

  it('couvre le même jeu dans les deux graisses', () => {
    expect(Object.keys(HELVETICA_BOLD.widths)).toEqual(Object.keys(HELVETICA.widths))
  })

  it('prévoit une largeur de repli non nulle', () => {
    expect(HELVETICA.fallback).toBeGreaterThan(0)
    expect(HELVETICA.capHeight).toBeGreaterThan(0)
  })
})
