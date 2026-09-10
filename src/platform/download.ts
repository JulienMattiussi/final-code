/**
 * Le seul point du code qui touche au navigateur, isolé pour que `src/lib` reste
 * du calcul pur et testable sans DOM.
 */
export function download(name: string, data: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
