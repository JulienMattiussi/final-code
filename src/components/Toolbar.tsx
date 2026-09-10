/**
 * La barre est en deux groupes étiquetés, comme dans les autres traceur- et pour
 * la même raison : mélangés, il fallait relire toute la barre pour trouver le
 * bouton de sortie.
 */

interface ToolbarProps {
  solution: boolean
  onSolution: (value: boolean) => void
  onExportSvg: () => void
  onExportPdf: () => void
  onPrint: () => void
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  )
}

function Button({
  onClick,
  pressed,
  children,
}: {
  onClick: () => void
  pressed?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 transition-colors ${
        pressed
          ? 'bg-slate-900 text-white ring-slate-900'
          : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

export function Toolbar({
  solution,
  onSolution,
  onExportSvg,
  onExportPdf,
  onPrint,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <Group label="Affichage">
        <Button onClick={() => onSolution(!solution)} pressed={solution}>
          Voir la solution
        </Button>
      </Group>

      <Group label="Exporter">
        <Button onClick={onExportPdf}>PDF</Button>
        <Button onClick={onExportSvg}>SVG</Button>
        <Button onClick={onPrint}>Imprimer</Button>
      </Group>
    </div>
  )
}
