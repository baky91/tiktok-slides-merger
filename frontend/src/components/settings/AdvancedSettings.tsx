import { useState } from 'react'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Quality } from '../../types'
import { useSettings } from '../../contexts/SettingsProvider'
import { ColorSetting } from './ColorSetting'

export function AdvancedSettings() {
  const {
    spacing,
    setSpacing,
    lineColor,
    setLineColor,
    backgroundColor,
    setBackgroundColor,
    quality,
    setQuality,
  } = useSettings()
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
          <ColorSetting
            label="Line color"
            hint="Between the images"
            value={lineColor}
            onChange={setLineColor}
          />

          <ColorSetting
            label="Background color"
            hint="Behind smaller images and empty cells"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />

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
