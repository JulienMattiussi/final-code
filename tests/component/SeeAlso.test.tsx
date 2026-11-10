import { render, screen } from '@testing-library/react'
import { SeeAlso } from '@/components/SeeAlso'

describe('SeeAlso', () => {
  it('lists the three sibling tools, not the current one', () => {
    render(<SeeAlso current="final-code" />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links.map((a) => a.getAttribute('href'))).not.toContain(
      'https://final-code-grid.yavadeus.dev/',
    )
  })
})
