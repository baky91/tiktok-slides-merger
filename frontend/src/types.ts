export const Layout = {
  Vertical: 'vertical',
  Horizontal: 'horizontal',
  Grid: 'grid',
} as const
export type Layout = (typeof Layout)[keyof typeof Layout]

export const Format = {
  JPEG: 'JPEG',
  // PNG: 'PNG',
  PDF: 'PDF',
} as const
export type Format = (typeof Format)[keyof typeof Format]

export const Quality = {
  Standard: 'Standard',
  High: 'High',
  // Max: 'max',
} as const
export type Quality = (typeof Quality)[keyof typeof Quality]

export const Status = {
  Idle: 'idle',
  Loading: 'loading',
  Ready: 'ready',
  Error: 'error',
} as const
export type Status = (typeof Status)[keyof typeof Status]

export const Background = {
  white: '#ffffff',
  black: '#000000',
} as const
export type Background = (typeof Background)[keyof typeof Background]
