import { TextArea, TextField } from '@/components/Field'
import { toGroups } from '@/lib/normalize'
import type { Settings } from '@/lib/settings'

interface WordsPanelProps {
  settings: Settings
  onChange: (settings: Settings) => void
}

export function WordsPanel({ settings, onChange }: WordsPanelProps) {
  const update = <K extends keyof Settings>(key: K, value: Settings[K]): void =>
    onChange({ ...settings, [key]: value })

  const groups = toGroups(settings.solution)
  const letters = groups.join('').length
  const lines = settings.list.split('\n').filter((line) => line.trim().length > 0).length

  const shape =
    groups.length > 1
      ? `, en ${groups.length} groupes détachés par un blanc dans la grille`
      : ' : les espaces ne prennent pas de case'

  return (
    <div className="space-y-3.5">
      <TextField
        label="Le mot ou la phrase à trouver"
        value={settings.solution}
        placeholder="anniversaire"
        hint={`${letters} lettre${letters > 1 ? 's' : ''}, donc ${letters} ligne${letters > 1 ? 's' : ''}${shape}.`}
        onChange={(value) => update('solution', value)}
      />

      <TextArea
        label="Les mots, un par ligne, précédés de leur référence"
        value={settings.list}
        rows={12}
        placeholder={'A1 ballon\nA2 gateau'}
        hint={`${lines} ligne${lines > 1 ? 's' : ''} saisie${lines > 1 ? 's' : ''}. La référence est le code qui contient un chiffre, avant le mot : « A1 ballon », « K7 : gateau ».`}
        onChange={(value) => update('list', value)}
      />
    </div>
  )
}
