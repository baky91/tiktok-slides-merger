export const Layout = {
  Vertical: 'vertical',
  Horizontal: 'horizontal',
  Grid: 'grid',
} as const
export type Layout = (typeof Layout)[keyof typeof Layout]

export const Format = {
  PNG: 'PNG',
  PDF: 'PDF',
} as const
export type Format = (typeof Format)[keyof typeof Format]

export const Status = {
  Idle: 'idle',
  Loading: 'loading',
  Ready: 'ready',
  Error: 'error',
} as const
export type Status = (typeof Status)[keyof typeof Status]
