import { useId } from 'react'

/**
 * Les deux briques de saisie du projet. Les dupliquer dans chaque panneau les
 * aurait fait dériver de style.
 *
 * L'aide est rattachée par `aria-describedby` et non posée dans le `label` :
 * sinon elle entre dans le nom accessible du champ, qu'un lecteur d'écran
 * annonce alors en entier à chaque fois.
 */

const BOX =
  'w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 focus:outline-none'

const LABEL = 'mb-1.5 block text-sm font-medium text-slate-800'
const HINT = 'mt-1 block text-xs leading-snug text-slate-500'

interface FieldProps {
  label: string
  value: string
  hint?: string
  placeholder?: string
  onChange: (value: string) => void
}

export function TextField({ label, value, hint, placeholder, onChange }: FieldProps) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={BOX}
      />
      {hint ? (
        <span id={`${id}-hint`} className={HINT}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}

export function TextArea({
  label,
  value,
  hint,
  placeholder,
  rows = 3,
  onChange,
}: FieldProps & { rows?: number }) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${BOX} resize-y font-mono`}
      />
      {hint ? (
        <span id={`${id}-hint`} className={HINT}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
