import type { RefIssues } from '@/lib/refs'
import type { Failure } from '@/lib/solve'

/**
 * Les diagnostics en français, séparés de `solve.ts` pour que le moteur reste une
 * affaire de structures et l'interface une affaire de phrases.
 */

export function describeFailure(failure: Failure): string {
  switch (failure.kind) {
    case 'vide':
      return 'Écris la solution et la liste des mots pour construire la grille.'

    case 'compte': {
      const words = `${failure.words} mot${failure.words > 1 ? 's' : ''}`
      const letters = `${failure.letters} lettre${failure.letters > 1 ? 's' : ''}`
      return `${words} pour ${letters} : il en faut autant de chaque, une ligne par lettre.`
    }

    case 'lettres': {
      const plural = failure.letters.length > 1
      return `Aucun mot ne contient ${plural ? 'les lettres' : 'la lettre'} ${enumerate(failure.letters)}.`
    }

    case 'mots': {
      const plural = failure.words.length > 1
      return `${enumerate(failure.words)} ne contien${plural ? 'nent' : 't'} aucune lettre de la solution.`
    }

    case 'conflit': {
      const found = failure.letters.length > 1 ? 'ne se trouvent' : 'ne se trouve'
      return (
        `${failure.rows} lignes se partagent trop peu de mots : ` +
        `${enumerate(failure.letters)} ${found} que dans ${enumerate(failure.words)}.`
      )
    }
  }
}

export function describeRefIssues(issues: RefIssues): string | null {
  const parts: string[] = []

  if (issues.missing.length > 0) {
    const plural = issues.missing.length > 1
    parts.push(
      `${enumerate(issues.missing)} ${plural ? 'sont' : 'est'} sans référence` +
        ` (écris « A1 ${issues.missing[0]!} »)`,
    )
  }
  if (issues.duplicated.length > 0) {
    parts.push(
      issues.duplicated.length > 1
        ? `les références ${enumerate(issues.duplicated)} servent chacune à plusieurs mots`
        : `la référence ${issues.duplicated[0]!} sert à plusieurs mots`,
    )
  }

  return parts.length > 0 ? `${capitalize(parts.join(', et '))}.` : null
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** « A », « A et B », « A, B et C ». */
function enumerate(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]!}`
}
