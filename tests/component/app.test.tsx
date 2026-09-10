import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

function sheet(): SVGSVGElement {
  const svg = document.querySelector('.sheet svg')
  if (!svg) throw new Error('aucune feuille affichée')
  return svg as SVGSVGElement
}

function texts(): string[] {
  return [...sheet().querySelectorAll('text')].map((node) => node.textContent ?? '')
}

describe('App', () => {
  it('affiche le titre de l’application', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('final-code')
  })

  it('montre une feuille prête dès l’ouverture', () => {
    render(<App />)

    expect(sheet()).toHaveAttribute('viewBox', '0 0 210 297')
    expect(texts()).toContain('A1')
    expect(texts()).toContain('A6')
    // Deux séries de codes dans l'exemple : elles doivent arriver telles quelles
    // sur la feuille, sans renumérotation.
    expect(texts()).toContain('K1')
    expect(texts()).toContain('K6')
  })

  it('laisse les cases vides et n’écrit les mots que sur demande', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(texts()).not.toContain('B')

    await user.click(screen.getByRole('button', { name: 'Voir la solution' }))

    expect(texts()).toContain('B')
    expect(screen.getByRole('button', { name: 'Voir la solution' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('offre les trois sorties', () => {
    render(<App />)

    for (const name of ['PDF', 'SVG', 'Imprimer']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('récapitule où chaque mot est tombé', () => {
    render(<App />)

    const lines = screen.getAllByRole('row')

    // Le premier mot de la liste n'est pas celui de la première ligne : c'est le
    // solveur qui décide de l'ordre.
    expect(lines[1]).toHaveTextContent('ballon')
    expect(lines[1]).toHaveTextContent('A1')
  })

  it('explique ce qui manque au lieu d’afficher une feuille fausse', async () => {
    const user = userEvent.setup()
    render(<App />)

    const solution = screen.getByLabelText('Le mot ou la phrase à trouver')
    await user.clear(solution)
    await user.type(solution, 'xylophone')

    expect(screen.getByRole('alert')).toHaveTextContent('12 mots pour 9 lettres')
    expect(document.querySelector('.sheet svg')).toBeNull()
  })

  it('signale un mot sans référence sans refuser la grille', async () => {
    const user = userEvent.setup()
    render(<App />)

    const list = screen.getByLabelText('Les mots, un par ligne, précédés de leur référence')
    await user.clear(list)
    await user.type(list, 'crabe\nA2 mouette\nA3 sable')

    const solutionField = screen.getByLabelText('Le mot ou la phrase à trouver')
    await user.clear(solutionField)
    await user.type(solutionField, 'mer')

    expect(screen.getByText(/sans référence/)).toBeInTheDocument()
    expect(sheet()).toBeInTheDocument()
  })

  it('suit le titre et la consigne saisis', async () => {
    const user = userEvent.setup()
    render(<App />)

    const title = screen.getByLabelText('Titre')
    await user.clear(title)
    await user.type(title, 'Rallye du village')

    expect(texts()).toContain('Rallye du village')
  })
})
