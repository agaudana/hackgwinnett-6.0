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
  food: <><path d="M7 3v8a2 2 0 0 0 4 0V3M9 3v18M17 3c-2 0-3 2-3 5s1 4 3 4v9" /></>,
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  warning: <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18h.01" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  upload: <><path d="M12 15V4M7 9l5-5 5 5M4 15v5h16v-5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
  sliders: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  print: <><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  pencil: <><path d="M4 20l1-5L16 4l4 4L9 19z" /><path d="M14 6l4 4" /></>,
  tick: <path d="M5 12.5l4.5 4.5L19 7.5" />,
}

export default function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name] ?? PATHS.check}
    </svg>
  )
}
