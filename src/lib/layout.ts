import type { Grid, SheetContent } from '@/lib/types'

/**
 * Géométrie de la feuille, en millimètres de papier.
 *
 * Comme dans les autres traceur-, le moteur raisonne en millimètres et non en
 * pixels : ce qui doit rester vrai, c'est la taille imprimée des cases, seule
 * unité qui dise si on peut encore écrire une lettre à la main dedans.
 */

export const PAGE = { widthMm: 210, heightMm: 297 }

export const MARGIN_MM = 12

/** Corps du titre et de la consigne, en millimètres. */
export const TITLE_MM = 7
export const NOTE_MM = 4.2

/**
 * Place réservée à la référence devant la première case, en part de case. Une
 * grille de plus de neuf lignes écrit « A10 », soit trois signes, plus le blanc
 * qui la détache de la grille.
 */
const LABEL_RATIO = 2.1

/** Au-delà, une grille de quatre lignes deviendrait une affiche. */
const MAX_CELL_MM = 14

/** Sous cette taille, la case ne reçoit plus une lettre écrite à la main. */
export const MIN_CELL_MM = 6

/**
 * Le blanc qui sépare deux mots de la solution, en part de case. Assez pour que
 * la coupure se voie, pas assez pour qu'on la prenne pour une ligne oubliée.
 */
const ROW_GAP = 0.45

/**
 * L'ordonnée de chaque ligne, en hauteurs de case. Les lignes ne sont plus à un
 * pas régulier dès que la solution est une phrase, donc c'est ici, et nulle part
 * ailleurs, qu'on décide où tombe une ligne.
 */
export function rowOffsets(groups: readonly number[]): number[] {
  const offsets: number[] = []
  let unit = 0

  groups.forEach((size, group) => {
    if (group > 0) unit += ROW_GAP
    for (let row = 0; row < size; row++) offsets.push(unit++)
  })

  return offsets
}

/** La hauteur totale de la grille, blancs compris, en hauteurs de case. */
export function gridUnits(groups: readonly number[]): number {
  const rows = groups.reduce((total, size) => total + size, 0)
  return rows + Math.max(groups.length - 1, 0) * ROW_GAP
}

export interface Layout {
  cellMm: number
  labelMm: number
  /** Coin haut gauche de la case (colonne 0, ligne 0). */
  gridX: number
  gridY: number
  /** Lignes de base du titre et de la consigne, absentes si le texte l'est. */
  titleY: number | null
  noteY: number | null
}

export function layoutFor(grid: Grid, content: SheetContent): Layout {
  const units = Math.max(gridUnits(grid.groups), 1)

  let cursor = MARGIN_MM
  let titleY: number | null = null
  let noteY: number | null = null

  if (content.title.length > 0) {
    cursor += TITLE_MM
    titleY = cursor
    cursor += TITLE_MM * 0.5
  }
  if (content.note.length > 0) {
    cursor += NOTE_MM
    noteY = cursor
    cursor += NOTE_MM * 0.8
  }

  const usableWidth = PAGE.widthMm - 2 * MARGIN_MM
  const usableHeight = PAGE.heightMm - MARGIN_MM - cursor

  // La référence mord sur la marge de gauche de la même façon quelle que soit la
  // ligne : c'est devant la colonne 0 qu'il faut lui faire de la place, les autres
  // lignes commencent plus à droite et en ont de reste.
  const cellMm = Math.min(
    MAX_CELL_MM,
    usableWidth / (grid.columns + LABEL_RATIO),
    usableHeight / units,
  )
  const blockWidth = (grid.columns + LABEL_RATIO) * cellMm

  /**
   * Le blanc qui reste est partagé au-dessus du titre et sous la grille, et non
   * glissé entre les deux : c'est le bloc entier qui est centré. Centrer la
   * seule grille laissait le titre seul en haut de page, séparé de ce qu'il
   * annonce par une bande vide qui se lisait comme un oubli.
   */
  const slack = (usableHeight - units * cellMm) / 2

  return {
    cellMm,
    labelMm: LABEL_RATIO * cellMm,
    gridX: MARGIN_MM + (usableWidth - blockWidth) / 2 + LABEL_RATIO * cellMm,
    gridY: cursor + slack,
    titleY: titleY === null ? null : titleY + slack,
    noteY: noteY === null ? null : noteY + slack,
  }
}
