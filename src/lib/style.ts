import { HELVETICA } from '@/lib/fonts'

/**
 * Comment la feuille est dessinée, quand `layout.ts` dit où. Ces valeurs sont
 * partagées par le rendu SVG et par l'export PDF : si l'un s'écartait de
 * l'autre, l'aperçu cesserait d'être une promesse.
 */

export const PALETTE = {
  paper: '#ffffff',
  ink: '#0f172a',
  rule: '#94a3b8',
  label: '#475569',
  axisFill: '#e0f2fe',
  axisRule: '#0284c7',
}

/**
 * Helvetica est l'une des quatorze polices que tout lecteur PDF possède, donc
 * rien à embarquer à l'export ; à l'écran, la même pile de polices est demandée.
 */
export const CSS_FONT = 'Helvetica, Arial, sans-serif'

/** Traits, en millimètres. */
export const RULE_WIDTH_MM = 0.3
export const AXIS_WIDTH_MM = 0.7

/** Proportions du dessin d'une case, en part de case. */
export const LETTER_SIZE = 0.6
export const REF_SIZE = 0.44
export const REF_GAP = 0.45
export const CORNER = 0.08

/**
 * Ligne de base d'un texte en capitales centré dans sa case, en part de case.
 * Déduite de la hauteur de capitale plutôt que réglée à l'oeil : c'est ce qui
 * fait tomber la lettre exactement au même endroit dans l'aperçu et dans le PDF.
 */
export function baselineFor(size: number): number {
  return (1 + (size * HELVETICA.capHeight) / 1000) / 2
}
