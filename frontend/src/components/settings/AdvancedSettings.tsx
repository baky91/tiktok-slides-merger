import { useState } from 'react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { LineColor, Quality } from '../../types'
import { useSettings } from '../../contexts/SettingsProvider'

export function AdvancedSettings() {
  const { spacing, setSpacing, lineColor, setLineColor, quality, setQuality } =
    useSettings()
  const [open, setOpen] = useState(false)

  return (
    <div className="advanced-wrap">
      <Button className="advanced-button" onClick={() => setOpen(!open)}>
        <span>Advanced settings</span>
        <Icon name="chevron" size={16} />
      </Button>
      {open && (
        <div className="advanced-content">
          <div className="advanced-setting">
            <div className="label-row">
              <span className="control-label">Image spacing</span>
              <span className="value">{spacing} %</span>
            </div>
            <input
              className="range"
              aria-label="Image spacing"
              type="range"
              min="0"
              max="10"
              value={spacing}
              onChange={(event) => setSpacing(Number(event.target.value))}
            />
            <div className="range-labels">
              <span>None</span>
              <span>Wide</span>
            </div>
          </div>
          <div className="line-color-setting">
            <span>Line color</span>
            <div className="color-options">
              {Object.entries(LineColor).map(([name, item]) => (
                <i
                  key={item}
                  role="button"
                  aria-label={`Line color ${name}`}
                  className={lineColor === item ? 'selected' : ''}
                  style={{ background: item }}
                  onClick={() => setLineColor(item)}
                ></i>
              ))}
            </div>
          </div>

          <div className="segmented">
            {Object.values(Quality).map((item) => (
              <Button
                key={item}
                className={quality === item ? 'active' : ''}
                onClick={() => setQuality(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
