import { useId, useMemo, useState, type ReactNode } from 'react'
import { Controls } from '@/components/Controls'
import { Logo } from '@/components/Logo'
import { Sheet } from '@/components/Sheet'
import { Summary } from '@/components/Summary'
import { Toolbar } from '@/components/Toolbar'
import { WordsPanel } from '@/components/WordsPanel'
import { describeFailure, describeRefIssues } from '@/lib/messages'
import { parseWords } from '@/lib/normalize'
import { refIssues } from '@/lib/refs'
import { DEFAULT_SETTINGS, type Settings } from '@/lib/settings'
import { renderPdf } from '@/lib/pdf'
import { solve } from '@/lib/solve'
import { renderSheet } from '@/lib/svg'
import { download } from '@/platform/download'
import { SeeAlso } from '@/components/SeeAlso'

/**
 * Le titre est rattaché à la section par `aria-labelledby`, sans quoi celle-ci
 * n'a pas de nom accessible et n'est pas annoncée comme un repère : un lecteur
 * d'écran ne peut alors pas sauter de « La grille » à « Récapitulatif ».
 */
function Card({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
    >
      <h2 id={id} className="mb-3 text-sm font-semibold text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [solution, setSolution] = useState(false)

  const words = useMemo(() => parseWords(settings.list), [settings.list])
  const result = useMemo(() => solve(words, settings.solution), [words, settings.solution])
  const warning = useMemo(() => describeRefIssues(refIssues(words)), [words])

  // Mémoïsés parce qu'ils servent de dépendance au rendu de la feuille : recréés
  // à chaque frappe, ils le rejoueraient même quand le dessin ne change pas.
  const content = useMemo(
    () => ({ title: settings.title, note: settings.note }),
    [settings.title, settings.note],
  )
  const options = useMemo(() => ({ ...content, solution }), [content, solution])

  const baseName = solution ? 'grille-solution' : 'grille'

  const exportSvg = (): void => {
    if (!result.ok) return
    download(`${baseName}.svg`, renderSheet(result.grid, options), 'image/svg+xml')
  }

  const exportPdf = (): void => {
    if (!result.ok) return
    download(`${baseName}.pdf`, renderPdf(result.grid, options), 'application/pdf')
  }

  return (
    <div className="min-h-screen print:min-h-0">
      <div className="mx-auto max-w-6xl px-6 py-8 print:p-0">
        <header className="flex items-center gap-3.5 print:hidden">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <Logo className="h-9 w-9 text-slate-900" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">final-code</h1>
            <p className="text-sm text-slate-600">
              Place une liste de mots pour qu&apos;une colonne verticale révèle la solution, et
              imprime la grille à remplir.
            </p>
          </div>
        </header>

        <div className="mt-7 grid gap-6 lg:grid-cols-[21rem_1fr] print:mt-0 print:gap-0">
          <aside className="space-y-4 print:hidden">
            <Card title="La grille">
              <WordsPanel settings={settings} onChange={setSettings} />
              {warning ? (
                <p role="status" className="mt-3 text-xs leading-snug text-amber-800">
                  {warning}
                </p>
              ) : null}
            </Card>

            <Card title="La feuille">
              <Controls settings={settings} onChange={setSettings} />
            </Card>

            {result.ok ? (
              <Card title="Récapitulatif">
                <Summary grid={result.grid} content={content} />
              </Card>
            ) : null}
          </aside>

          <main>
            {result.ok ? (
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 print:rounded-none print:shadow-none print:ring-0">
                <div className="border-b border-slate-200/70 bg-slate-50/70 px-4 py-3 print:hidden">
                  <Toolbar
                    solution={solution}
                    onSolution={setSolution}
                    onExportSvg={exportSvg}
                    onExportPdf={exportPdf}
                    onPrint={() => window.print()}
                  />
                </div>

                <div className="p-4 print:p-0">
                  <Sheet grid={result.grid} options={options} />
                </div>
              </div>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 px-6 text-center">
                <Logo className="h-14 w-14 text-slate-300" />
                <p role="alert" className="max-w-sm text-sm text-slate-600">
                  {describeFailure(result.failure)}
                </p>
              </div>
            )}
          </main>
        </div>

        <SeeAlso current="final-code" />

        <footer className="mt-10 text-center text-sm text-slate-500 print:hidden">
          <a
            href="https://github.com/JulienMattiussi/final-code"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:text-slate-900"
          >
            Fait avec <span className="text-rose-500">&#10084;&#65039;</span> par{' '}
            <span className="font-medium underline decoration-sky-400 decoration-2 underline-offset-4">
              YavaDeus
            </span>
          </a>
        </footer>
      </div>
    </div>
  )
}
