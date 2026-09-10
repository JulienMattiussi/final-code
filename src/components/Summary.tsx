import { layoutFor, MIN_CELL_MM } from '@/lib/layout'
import type { Grid, SheetContent } from '@/lib/types'

/**
 * Ce que la grille est devenue, et où chaque mot est tombé. L'ordre des lignes
 * n'est pas celui de la saisie, donc c'est ici qu'on vérifie quelle référence
 * l'imprimante va poser sur quelle ligne.
 */

interface SummaryProps {
  grid: Grid
  content: SheetContent
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200/70">
      <span className="block text-base font-semibold text-slate-900">{value}</span>
      <span className="block text-xs text-slate-600">{label}</span>
    </div>
  )
}

export function Summary({ grid, content }: SummaryProps) {
  const layout = layoutFor(grid, content)
  const cell = Math.round(layout.cellMm * 10) / 10
  const cramped = layout.cellMm < MIN_CELL_MM

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Tile value={String(grid.rows.length)} label="lignes" />
        <Tile value={String(grid.columns)} label="colonnes" />
        <Tile value={`${cell} mm`} label="par case" />
      </div>

      {cramped ? (
        <p role="status" className="text-xs leading-snug text-amber-800">
          Les cases descendent sous {MIN_CELL_MM} mm : on n&apos;y écrit plus à la main. Raccourcis
          les mots les plus longs ou la solution.
        </p>
      ) : null}

      <table className="w-full text-left text-sm">
        <caption className="sr-only">Où chaque mot tombe dans la grille</caption>
        <thead>
          <tr className="text-xs font-semibold text-slate-500 uppercase">
            <th scope="col" className="py-1">
              Ligne
            </th>
            <th scope="col" className="py-1">
              Réf.
            </th>
            <th scope="col" className="py-1">
              Mot
            </th>
            <th scope="col" className="py-1">
              Lettre
            </th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {grid.rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-200/70">
              <td className="py-1 tabular-nums">{index + 1}</td>
              <td className="py-1 font-medium">{row.word.ref || '-'}</td>
              <td className="py-1">{row.word.label}</td>
              <td className="py-1 font-semibold text-sky-700">{grid.solution[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
