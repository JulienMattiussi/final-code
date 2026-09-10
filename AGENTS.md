# final-code

Fabrique une **grille de mots à imprimer** : on donne un mot (ou une phrase)
solution et une liste de mots référencés, l'outil place chaque mot sur sa ligne de
façon qu'une **colonne verticale** épelle la solution, et sort une feuille A4
portrait à remplir à la main. Une bascule « solution » imprime la même grille
remplie, comme corrigé.

Pour qui organise une chasse au trésor ou un rallye : chaque mot porte un code
(`A1`, `K7`, ...) saisi par l'organisateur, écrit devant sa ligne sur la feuille.
Le joueur trouve le mot du code `A1` sur le terrain, l'écrit dans la ligne `A1`, et
la colonne encadrée finit par livrer la solution.

Application **100% front-end**, sans backend. Interface en **français**.

---

## Stack technique

| Outil | Usage |
|---|---|
| React 19 + TypeScript | UI |
| Vite | Build / dev server (port **2277**) |
| Tailwind CSS v4 | Styles (via `@tailwindcss/vite`, pas de config JS) |
| Vitest + Testing Library | Tests unitaires et composants |
| Prettier | Formatage |
| ESLint (typescript-eslint) | Linting |
| Knip | Détection des fichiers / exports / dépendances inutilisés |

---

## Arborescence

```
src/
├── lib/                      # Logique pure, zéro React (entièrement testée)
│   ├── types.ts              # Word, Row, Grid
│   ├── normalize.ts          # Saisie -> lettres A-Z, et « A1 mot » -> référence + mot
│   ├── matching.ts           # Couplage biparti (Kuhn) et témoin de Hall
│   ├── solve.ts              # La grille la plus étroite, ou pourquoi il n'y en a pas
│   ├── messages.ts           # Les diagnostics en français
│   ├── refs.ts               # Références manquantes ou en double
│   ├── layout.ts             # Géométrie de la feuille, en millimètres
│   ├── svg.ts                # Rendu de la feuille (aperçu, export, impression)
│   └── settings.ts           # Réglages et exemple de départ
├── components/               # Composants réutilisables
├── platform/                 # Le seul code qui touche au navigateur
├── App.tsx                   # Racine de l'application
├── main.tsx                  # Point d'entrée
└── index.css                 # Tailwind + thème (fond, règles d'impression)
public/
└── favicon.svg
tests/
├── setup.ts                  # jest-dom
├── unit/                     # Vitest - logique pure
└── component/                # Vitest + Testing Library
```

L'alias `@/` pointe sur `src/` (déclaré dans `tsconfig.app.json`, `vite.config.ts` et
`vitest.config.ts` : les trois doivent rester d'accord).

`base: './'` dans `vite.config.ts` : le site fonctionne aussi servi depuis un
sous-répertoire.

---

## Comment la grille est trouvée

Deux choix s'enchaînent et ne peuvent pas se décider séparément :

1. **Quel mot sur quelle ligne.** Un mot ne va sur la ligne d'une lettre que s'il
   la contient : c'est un couplage biparti, pas un tri. Prendre à chaque fois le
   premier mot qui convient échoue là où une solution existe, parce que ce mot
   peut être le seul possible pour une ligne suivante. D'où l'algorithme de Kuhn,
   qui déplace les mots déjà posés le long d'un chemin alternant.
2. **Quelle occurrence de la lettre.** `BANANE` peut donner son `A` en deuxième ou
   en quatrième position, ce qui décale toute la ligne et change la largeur de la
   grille.

`solve.ts` fixe donc un **budget de colonnes** à gauche et à droite de la colonne
solution, ne garde que les occurrences qui y tiennent, et demande un couplage
complet. Les budgets sont essayés par largeur croissante : le premier qui passe
donne **la grille la plus étroite qui existe**. À largeur égale, la colonne
solution la plus centrée gagne. Il en découle un invariant que les tests
vérifient : aucune colonne vide sur les bords.

### Dire pourquoi c'est impossible
Trois cas, annoncés du plus simple au plus subtil : une lettre qu'aucun mot ne
porte, un mot qui ne porte aucune lettre de la solution, et le conflit, où chaque
mot et chaque lettre semblent pourtant plaçables. Ce dernier n'est pas deviné : le
**témoin de Hall** de `matching.ts` remonte les chemins alternants depuis une ligne
restée vide et rend le groupe de lignes qui se disputent trop peu de mots.

### La feuille
Le moteur raisonne en **millimètres de papier**, jamais en pixels : la seule unité
qui dise si on peut encore écrire une lettre à la main dans une case est sa taille
imprimée (`MIN_CELL_MM`, 6 mm). `layout.ts` déduit la taille de case de la place
restante, réserve devant la colonne 0 le blanc de l'étiquette, et centre le tout.
`svg.ts` est le **seul rendu**, partagé par l'aperçu, l'export et l'impression :
ce qui est vu à l'écran est exactement ce qui sort de l'imprimante.

La colonne solution est **teintée et cerclée d'un trait épais** : teintée
seulement, elle disparaîtrait à l'impression en noir et blanc.

Quand la solution est une **phrase**, un espace ne prend pas de case mais il ne
disparaît pas : les lignes sont groupées par mot de la solution et un blanc les
détache (`ROW_GAP`, en part de case). Les lignes n'étant alors plus à un pas
régulier, `rowOffsets` est le seul endroit qui décide où tombe une ligne, et
`gridUnits` compte ces blancs dans la hauteur pour que la taille de case reste
juste. La colonne solution reçoit **un cadre par groupe**, sinon le trait
enjamberait le blanc.

### Mise en page d'impression
La feuille doit tenir sur **une seule page**, d'où la borne `max-height: 96vh` sur
le SVG dans `index.css` (la marge couvre les en-têtes que le navigateur ajoute de
lui-même, hors de notre contrôle). Pour le vérifier :

```sh
make start
google-chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf=/tmp/p.pdf http://localhost:2277/
pdfinfo /tmp/p.pdf | grep Pages     # doit afficher 1
```

---

## Règles de développement

### Structure
- `src/lib/` : logique pure, zéro import React.
- Ce qui se répète descend dans `src/components/`.
- **Taille des fichiers** : viser < ~300 lignes ; au-delà, découper.

### Qualité du code
- **Factoriser, ne pas dupliquer.**
- **Pas de code mort** : tout export doit être utilisé ou testé. `make knip` doit
  rester vert.
- **Commentaires utiles seulement** : expliquer le pourquoi / le non-évident ; ne
  jamais paraphraser le code. Un hook (`.claude/hooks/flag-added-comments.py`)
  signale tout commentaire ajouté dans `src/` pour qu'il soit justifié ou retiré.

### Tests
- **Logique pure entièrement testée** (`src/lib/`).
- **Tests de composants** sur les écrans et la navigation.

### Accessibilité
- Tout cliquable est un bouton/lien avec libellé accessible ; champs avec label ou
  `aria-label` ; focus clavier visible ; ne jamais coder l'information par la seule
  couleur.

### Style
- Palette et typo définies en tokens Tailwind dans `src/index.css`.
- Typographie système, aucune requête externe.
- **Mobile d'abord** : tout doit tenir à 375 px de large sans débordement horizontal.

### Qualité (avant de considérer une tâche terminée)
- `make check` doit passer (build + lint + typecheck + knip + tests).

---

## Commandes (Makefile)

| Commande | Effet |
|---|---|
| `make install` | Installe les dépendances |
| `make start` | Serveur de dev (http://localhost:2277) |
| `make build` | Build de production |
| `make preview` | Sert le build de production |
| `make lint` | ESLint |
| `make knip` | Détecte fichiers / exports / dépendances inutilisés |
| `make format` | Formate avec Prettier |
| `make typecheck` | Vérifie les types |
| `make test` | Tests unitaires et composants |
| `make fix` | Format + lint |
| `make check` | build + lint + typecheck + knip + tests |
| `make clean` | Supprime les artefacts de build et les dépendances |

---

## Conventions globales du dépôt

- **Code en anglais** : commentaires, identifiants, noms de variables et de
  fonctions. Seules les valeurs affichées à l'utilisateur sont en français.
- **Commits** : pas de trailer `Co-Authored-By`. Auteur = le compte git de YavaDeus
  uniquement. Vaut aussi pour les descriptions de pull request.
- **Typographie** : ne jamais introduire de tiret long (em-dash ou en-dash) dans le
  code, les chaînes, les commentaires ou la doc. Utiliser un tiret ASCII `-`,
  deux-points, parenthèses, ou reformuler.
