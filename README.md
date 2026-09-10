<div align="center">

<img src="public/favicon.svg" width="88" alt="">

# final-code

**Une liste de mots, un mot solution, et une feuille A4 à imprimer : les mots se
placent tout seuls pour que la colonne verticale épelle la solution.**

[Documentation technique](AGENTS.md)

<sub>
  100 % front-end &nbsp;·&nbsp; React 19 + TypeScript &nbsp;·&nbsp; licence MIT
</sub>

</div>

---

## Ce que ça fait

Vous donnez la solution à trouver et la liste des mots, chacun précédé de son code :

```
A1 ballon
A2 gateau
A3 bougie
```

L'outil cherche **quel mot va sur quelle ligne** et **à quelle lettre l'accrocher**,
puis sort la grille la plus étroite qui marche, en A4 portrait. Sur la feuille,
chaque ligne montre des cases vides et son code à gauche ; la colonne encadrée est
celle où se lira la solution. Le bouton **Voir la solution** imprime le corrigé.

C'est fait pour une chasse au trésor : le joueur trouve le mot du code `A1` sur le
terrain, l'écrit dans la ligne `A1`, et la colonne finit par livrer le mot mystère.

La solution peut être une **phrase** : les espaces ne prennent pas de case, mais
les lignes se détachent en autant de groupes que de mots à trouver.

Si aucune grille n'existe, l'outil dit pourquoi : la lettre qu'aucun mot ne porte,
le mot qui ne sert à rien, ou les lignes qui se disputent le même mot.

---

## Démarrer

```sh
make install
make start          # http://localhost:2277
```

| Commande | Effet |
|---|---|
| `make check` | build + lint + typecheck + knip + tests |
| `make test` | tests unitaires et de composants |
| `make fix` | formate puis lint |

`make help` liste tout.

## Licence

[MIT](LICENSE).

---

<div align="center">
  <sub>
    Made with ❤️ by
    <a href="https://github.com/JulienMattiussi/final-code"><b>YavaDeus</b></a>
  </sub>
</div>
