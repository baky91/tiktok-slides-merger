import { useState } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { Background, Quality } from '../types'

type AdvancedSettingsProps = {
  spacing: number
  onSpacingChange: (spacing: number) => void
  quality: Quality
  onQualityChange: (quality: Quality) => void
  background: string
  onBackgroundChange: (background: string) => void
}

export function AdvancedSettings({
  spacing,
  onSpacingChange,
  quality,
  onQualityChange,
  background,
  onBackgroundChange,
}: AdvancedSettingsProps) {
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
              <span className="value">{spacing} px</span>
            </div>
            <input
              className="range"
              aria-label="Image spacing"
              type="range"
              min="0"
              max="28"
              value={spacing}
              onChange={(event) => onSpacingChange(Number(event.target.value))}
            />
            <div className="range-labels">
              <span>None</span>
              <span>Wide</span>
            </div>
          </div>
          <div className="background-setting">
            <span>Document background</span>
            <div className="color-options">
              {Object.values(Background).map((item) => (
                <i
                  key={item}
                  className={background === item ? 'selected' : ''}
                  style={{ background: item }}
                  onClick={() => onBackgroundChange(item)}
                ></i>
              ))}
            </div>
          </div>

          <div className="segmented">
            {Object.values(Quality).map((item) => (
              <Button
                key={item}
                className={quality === item ? 'active' : ''}
                onClick={() => onQualityChange(item)}
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
