import { useMemo } from 'react'
import { renderSheet } from '@/lib/svg'
import type { Grid, SheetOptions } from '@/lib/types'

export function Sheet({ grid, options }: { grid: Grid; options: SheetOptions }) {
  const svg = useMemo(() => renderSheet(grid, options), [grid, options])

  return (
    <div
      className="sheet [&>svg]:h-auto [&>svg]:w-full"
      // Le SVG vient de notre propre rendu, et le seul texte d'utilisateur qui y
      // entre est échappé par `svg.ts`. Une seule implémentation, partagée avec
      // l'export et l'impression : ce qui est vu est exactement ce qui sort.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
