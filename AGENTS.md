# final-code

> **À compléter** : concept du projet, ce que fait l'application, pour qui.

Application **100% front-end**, sans backend. Interface en **français**.

---

## Stack technique

| Outil | Usage |
|---|---|
| React 19 + TypeScript | UI |
| Vite | Build / dev server (port **4242**) |
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
├── components/               # Composants réutilisables
├── App.tsx                   # Racine de l'application
├── main.tsx                  # Point d'entrée
└── index.css                 # Tailwind + thème (couleurs, typo, rayons)
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
| `make start` | Serveur de dev (http://localhost:4242) |
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
