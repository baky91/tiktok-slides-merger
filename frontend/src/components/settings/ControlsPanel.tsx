import { Format, Layout } from '../../types'
import { AdvancedSettings } from './AdvancedSettings'
import { Button } from '../Button'
import { ColumnsStepper } from './ColumnsStepper'
import { Icon } from '../Icon'
import { useSettings } from '../../contexts/SettingsProvider'

type ControlsPanelProps = {
  imageCount: number
  maxColumns: number
}

export function ControlsPanel({ imageCount, maxColumns }: ControlsPanelProps) {
  const { layout, setLayout, format, setFormat } = useSettings()
  const formats = Object.values(Format)

  return (
    <aside className="controls-panel">
      <div className="panel-heading">
        <div>
          <div className="section-kicker">Workspace</div>
          <div className="panel-title">Customize your file</div>
        </div>
        <div className="image-count">
          <Icon name="image" size={15} /> {imageCount} images
        </div>
      </div>

      <div className="control-section">
        <div className="label-row">
          <span className="control-label">Image layout</span>
          <span className="helper">Choose an arrangement</span>
        </div>
        <div className="layout-options">
          {(
            [
              [Layout.Vertical, 'Vertical'],
              [Layout.Horizontal, 'Horizontal'],
              [Layout.Grid, 'Grid'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              className={`layout-card ${layout === value ? 'selected' : ''}`}
              onClick={() => setLayout(value)}
            >
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
            <ColumnsStepper max={maxColumns} />
          </div>
        )}
      </div>

      {formats.length > 1 && (
        <div className="control-section">
          <div className="control-label">File format</div>
          <div className="segmented">
            {formats.map((item) => (
              <Button
                key={item}
                className={format === item ? 'active' : ''}
                onClick={() => setFormat(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      )}

      <AdvancedSettings />
    </aside>
  )
}
