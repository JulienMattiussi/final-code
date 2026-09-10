/**
 * La marque reprend le sujet : trois cases alignées, celle du milieu cerclée
 * comme la colonne solution. Le dessin est celui du favicon, aux couleurs près.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect
        x="6"
        y="14"
        width="16"
        height="16"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect x="24" y="14" width="16" height="16" rx="3" fill="currentColor" opacity="0.15" />
      <rect
        x="42"
        y="14"
        width="16"
        height="16"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect x="24" y="34" width="16" height="16" rx="3" fill="currentColor" opacity="0.15" />
      <rect
        x="23"
        y="13"
        width="18"
        height="38"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
      />
    </svg>
  )
}
