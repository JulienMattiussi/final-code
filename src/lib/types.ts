/**
 * Un mot de la liste : `label` est la saisie, `letters` ce qui entre en case, et
 * `ref` le code que l'utilisateur lui a donné, écrit devant sa ligne.
 */
export interface Word {
  ref: string
  label: string
  letters: string
}

export interface Row {
  word: Word
  /** Index, dans le mot, de la lettre qui tombe dans la colonne solution. */
  hit: number
  /** Colonne de la première lettre du mot. */
  start: number
}

/** Les textes de la feuille. Vides, ils ne prennent pas de place. */
export interface SheetContent {
  title: string
  note: string
}

export interface SheetOptions extends SheetContent {
  /** Écrit les mots dans les cases : la grille remplie sert de corrigé. */
  solution: boolean
}

export interface Grid {
  /** Les lettres de la solution, une par ligne. */
  solution: string
  /** Le nombre de lignes de chaque mot de la solution, dans l'ordre. */
  groups: number[]
  rows: Row[]
  /** Largeur de la grille, en cases. */
  columns: number
  /** La colonne où se lit la solution, commune à toutes les lignes. */
  axis: number
}
