type Props = {
  progress: number
  label?: string
}

export function ScrollScrub({ progress, label = 'scroll' }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100)
  return (
    <div className="scroll-scrub" aria-hidden>
      <div className="scroll-scrub__track">
        <div className="scroll-scrub__fill" style={{ width: `${pct}%` }} />
        <div className="scroll-scrub__thumb" style={{ left: `${pct}%` }} />
      </div>
      <span className="scroll-scrub__label">
        {label} · {pct}%
      </span>
    </div>
  )
}
