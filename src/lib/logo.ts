/**
 * La marque, en une seule source : l'en-tête du site la dessine en React, le
 * favicon est écrit à partir d'elle par `make favicon`. Recopiée à la main dans
 * le SVG servi, la deuxième version dérivait dès la première retouche.
 *
 * La figure est le sujet même de l'outil réduit à ce qui survit à seize pixels :
 * trois lignes de cases décalées, et la colonne solution qui les traverse. Les
 * lettres, elles, n'y seraient plus que des taches grises.
 */

export const MARK = {
  /** Côté du carré de dessin. */
  box: 64,
  cell: 15,
  radius: 3,
  /** Colonne solution : les trois lignes en ont toutes une case. */
  axis: { x: 25, y: 6, width: 15, height: 51 },
  cells: [
    { x: 10, y: 6 },
    { x: 25, y: 6 },
    { x: 40, y: 6 },
    { x: 25, y: 24 },
    { x: 40, y: 24 },
    { x: 10, y: 42 },
    { x: 25, y: 42 },
  ],
}

/** Les cases hors colonne solution, celles qui se dessinent en simple contour. */
export function plainCells(): { x: number; y: number }[] {
  return MARK.cells.filter((cell) => cell.x !== MARK.axis.x)
}
