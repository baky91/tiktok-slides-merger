import { useState } from 'react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Background, Quality } from '../../types'
import { useSettings } from '../../contexts/SettingsProvider'

export function AdvancedSettings() {
  const {
    spacing,
    setSpacing,
    background,
    setBackground,
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
              <span className="value">{spacing} px</span>
            </div>
            <input
              className="range"
              aria-label="Image spacing"
              type="range"
              min="0"
              max="28"
              value={spacing}
              onChange={(event) => setSpacing(Number(event.target.value))}
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
                  onClick={() => setBackground(item)}
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
