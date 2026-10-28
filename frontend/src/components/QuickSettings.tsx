import { Format, Layout } from '../types'
import { Button } from './Button'
import { Icon } from './Icon'

type QuickSettingsProps = {
  ref: React.Ref<HTMLDivElement>
  layout: Layout
  columns: number
  format: Format
  onLayoutChange: (layout: Layout) => void
  onColumnsChange: (columns: number) => void
  onFormatChange: (format: Format) => void
}

// Compact settings bar that stays pinned above the preview on mobile
export function QuickSettings({ ref, layout, columns, format, onLayoutChange, onColumnsChange, onFormatChange }: QuickSettingsProps) {
  return (
    <div ref={ref} className="quick-settings">
      <div className="quick-layouts">
        {Object.values(Layout).map((value) => (
          <Button key={value} aria-label={`${value} layout`} className={layout === value ? 'selected' : ''} onClick={() => onLayoutChange(value)}>
            <Icon name={value} size={17} />
          </Button>
        ))}
      </div>
      {layout === Layout.Grid && (
        <div className="stepper">
          <Button aria-label="Decrease columns" onClick={() => onColumnsChange(Math.max(2, columns - 1))}><Icon name="minus" size={14} /></Button>
          <span>{columns}</span>
          <Button aria-label="Increase columns" onClick={() => onColumnsChange(Math.min(3, columns + 1))}><Icon name="plus" size={14} /></Button>
        </div>
      )}
      <div className="segmented">
        {Object.values(Format).map((item) => <Button key={item} className={format === item ? 'active' : ''} onClick={() => onFormatChange(item)}>{item}</Button>)}
      </div>
    </div>
  )
}
