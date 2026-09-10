/**
 * Les réglages exposés à l'interface, et un exemple complet au démarrage : une
 * grille vide n'apprend rien de ce que fait l'outil, alors qu'une feuille déjà
 * prête se lit d'un coup d'oeil et se vide en deux gestes.
 */
export interface Settings {
  /** La saisie brute, une ligne « référence mot » par ligne. */
  list: string
  solution: string
  title: string
  note: string
}

export const DEFAULT_SETTINGS: Settings = {
  list: [
    'A1 ballon',
    'A2 gateau',
    'A3 bougie',
    'A4 cadeau',
    'A5 confetti',
    'A6 guirlande',
    'A7 invitation',
    'A8 surprise',
    'A9 chapeau',
    'A10 bonbon',
    'A11 musique',
    'A12 serpentin',
  ].join('\n'),
  solution: 'anniversaire',
  title: 'Le mot mystère',
  note: 'Écris le mot de chaque code dans sa ligne, puis lis la colonne encadrée.',
}
