import { Format, Layout } from '../types'
import { AdvancedSettings } from './AdvancedSettings'
import { Button } from './Button'
import { ColumnsStepper } from './ColumnsStepper'
import { Icon } from './Icon'

type ControlsPanelProps = {
  imageCount: number
  layout: Layout
  columns: number
  maxColumns: number
  format: Format
  spacing: number
  onLayoutChange: (layout: Layout) => void
  onColumnsChange: (columns: number) => void
  onFormatChange: (format: Format) => void
  onSpacingChange: (spacing: number) => void
}

export function ControlsPanel({
  imageCount,
  layout,
  columns,
  maxColumns,
  format,
  spacing,
  onLayoutChange,
  onColumnsChange,
  onFormatChange,
  onSpacingChange,
}: ControlsPanelProps) {
  return (
    <aside className="controls-panel">
      <div className="panel-heading">
        <div>
          <div className="section-kicker">Workspace</div>
          <div className="panel-title">Customize your file</div>
        </div>
        <div className="image-count"><Icon name="image" size={15} /> {imageCount} images</div>
      </div>

      <div className="control-section">
        <div className="label-row">
          <span className="control-label">Image layout</span>
          <span className="helper">Choose an arrangement</span>
        </div>
        <div className="layout-options">
          {([
            [Layout.Vertical, 'Vertical'],
            [Layout.Horizontal, 'Horizontal'],
            [Layout.Grid, 'Grid'],
          ] as const).map(([value, label]) => (
            <Button key={value} className={`layout-card ${layout === value ? 'selected' : ''}`} onClick={() => onLayoutChange(value)}>
              <Icon name={value} size={21} />
              <span>{label}</span>
              {layout === value && <i />}
            </Button>
          ))}
        </div>
        {layout === Layout.Grid && (
          <div className="sub-control">
            <div>
              <div className="sub-label">Grid columns</div>
              <div className="sub-copy">Set the number of columns</div>
            </div>
            <ColumnsStepper columns={columns} max={maxColumns} onChange={onColumnsChange} />
          </div>
        )}
      </div>

      <div className="control-section">
        <div className="control-label">File format</div>
        <div className="segmented">
          {Object.values(Format).map((item) => <Button key={item} className={format === item ? 'active' : ''} onClick={() => onFormatChange(item)}>{item}</Button>)}
        </div>
      </div>

      <AdvancedSettings spacing={spacing} onSpacingChange={onSpacingChange} />
    </aside>
  )
}
