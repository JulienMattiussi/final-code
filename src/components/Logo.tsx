import { MARK, plainCells } from '@/lib/logo'

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MARK.box} ${MARK.box}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {plainCells().map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={MARK.cell}
          height={MARK.cell}
          rx={MARK.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.45"
        />
      ))}

      <rect
        x={MARK.axis.x}
        y={MARK.axis.y}
        width={MARK.axis.width}
        height={MARK.axis.height}
        rx={MARK.radius}
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x={MARK.axis.x}
        y={MARK.axis.y}
        width={MARK.axis.width}
        height={MARK.axis.height}
        rx={MARK.radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
      />
    </svg>
  )
}
