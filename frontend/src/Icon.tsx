import type { ReactNode } from 'react'

const PATHS: Record<string, ReactNode> = {
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  medication: <><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)" /><path d="M9.2 7.9l5.6 8.2" /></>,
  thermometer: <><path d="M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z" /><path d="M12 9v7" /></>,
  emergency: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 8v8M8 12h8" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  sound: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  paper: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7M9 7h3" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /></>,
  lens: <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></>,
}

export default function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name] ?? PATHS.check}
    </svg>
  )
}
