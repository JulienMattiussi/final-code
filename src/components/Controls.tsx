import { TextField } from '@/components/Field'
import type { Settings } from '@/lib/settings'

interface ControlsProps {
  settings: Settings
  onChange: (settings: Settings) => void
}

export function Controls({ settings, onChange }: ControlsProps) {
  const update = <K extends keyof Settings>(key: K, value: Settings[K]): void =>
    onChange({ ...settings, [key]: value })

  return (
    <div className="space-y-3.5">
      <TextField
        label="Titre"
        value={settings.title}
        placeholder="Le mot mystère"
        hint="Vide, le titre disparaît et la grille prend la place."
        onChange={(value) => update('title', value)}
      />

      <TextField
        label="Consigne"
        value={settings.note}
        placeholder="Écris le mot de chaque code dans sa ligne."
        onChange={(value) => update('note', value)}
      />
    </div>
  )
}
