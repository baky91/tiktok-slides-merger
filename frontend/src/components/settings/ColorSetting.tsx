import { Color } from '../../types'
import { Button } from '../ui/Button'

type ColorSettingProps = {
  label: string
  hint: string
  value: Color
  onChange: (color: Color) => void
}

export function ColorSetting({
  label,
  hint,
  value,
  onChange,
}: ColorSettingProps) {
  return (
    <div className="color-setting">
      <div className="color-setting-text">
        <span className="control-label">{label}</span>
        <small>{hint}</small>
      </div>
      <div className="color-options">
        {Object.entries(Color).map(([name, color]) => (
          <Button
            key={color}
            type="button"
            aria-label={`${label}: ${name}`}
            aria-pressed={value === color}
            className={value === color ? 'selected' : ''}
            style={{ background: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  )
}
