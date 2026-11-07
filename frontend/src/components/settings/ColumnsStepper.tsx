import { useSettings } from '../../contexts/SettingsProvider'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { MIN_COLUMNS } from '../../utils/grid'

type ColumnsStepperProps = {
  max: number
}

export function ColumnsStepper({ max }: ColumnsStepperProps) {
  const { columns, setColumns } = useSettings()

  return (
    <div className="stepper">
      <Button
        aria-label="Decrease columns"
        disabled={columns <= MIN_COLUMNS}
        onClick={() => setColumns(Math.max(MIN_COLUMNS, columns - 1))}
      >
        <Icon name="minus" size={14} />
      </Button>
      <span style={{ textAlign: 'center' }}>{columns}</span>
      <Button
        aria-label="Increase columns"
        disabled={columns >= max}
        onClick={() => setColumns(Math.min(max, columns + 1))}
      >
        <Icon name="plus" size={14} />
      </Button>
    </div>
  )
}
