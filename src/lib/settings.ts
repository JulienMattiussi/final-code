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
  // Deux séries de codes plutôt qu'une seule qui court : c'est ainsi qu'on
  // référence deux zones de jeu, et ça montre d'entrée que les codes sont libres.
  list: [
    'A1 ballon',
    'A2 gateau',
    'A3 bougie',
    'A4 cadeau',
    'A5 confetti',
    'A6 guirlande',
    'K1 invitation',
    'K2 surprise',
    'K3 chapeau',
    'K4 bonbon',
    'K5 musique',
    'K6 serpentin',
  ].join('\n'),
  solution: 'anniversaire',
  title: 'Le mot mystère',
  note: 'Écris le mot de chaque code dans sa ligne, puis lis la colonne encadrée.',
}
