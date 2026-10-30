import { Format, Layout } from '../../types'
import { Button } from '../Button'
import { ColumnsStepper } from './ColumnsStepper'
import { Icon } from '../Icon'
import { useSettings } from '../../contexts/SettingsProvider'

type QuickSettingsProps = {
  ref: React.Ref<HTMLDivElement>
  maxColumns: number
}

// Compact settings bar that stays pinned above the preview on mobile
export function QuickSettings({ ref, maxColumns }: QuickSettingsProps) {
  const { layout, setLayout, format, setFormat } = useSettings()

  return (
    <div ref={ref} className="quick-settings">
      <div className="quick-layouts">
        {Object.values(Layout).map((value) => (
          <Button
            key={value}
            aria-label={`${value} layout`}
            className={layout === value ? 'selected' : ''}
            onClick={() => setLayout(value)}
          >
            <Icon name={value} size={17} />
          </Button>
        ))}
      </div>
      {layout === Layout.Grid && <ColumnsStepper max={maxColumns} />}
      <div className="segmented">
        {Object.values(Format).map((item) => (
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
  )
}
