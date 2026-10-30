import { createContext, useContext, useState, type ReactNode } from 'react'
import { Format, Layout, LineColor, Quality } from '../types'

interface SettingsContextType {
  layout: Layout
  columns: number
  format: Format
  quality: Quality
  spacing: number
  lineColor: LineColor
  setLayout: (layout: Layout) => void
  setColumns: (columns: number) => void
  setFormat: (format: Format) => void
  setQuality: (quality: Quality) => void
  setSpacing: (spacing: number) => void
  setLineColor: (lineColor: LineColor) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext)
  if (!context)
    throw new Error('useSettings must be used in a SettingsProvider')
  return context
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<Layout>(Layout.Grid)
  const [format, setFormat] = useState<Format>(Format.JPEG)
  const [quality, setQuality] = useState<Quality>(Quality.Standard)
  const [columns, setColumns] = useState(2)
  // Gap between images, as a percentage of the image width
  const [spacing, setSpacing] = useState(1)
  const [lineColor, setLineColor] = useState<LineColor>(LineColor.black)

  const value: SettingsContextType = {
    layout,
    setLayout,
    format,
    setFormat,
    quality,
    setQuality,
    columns,
    setColumns,
    spacing,
    setSpacing,
    lineColor,
    setLineColor,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
