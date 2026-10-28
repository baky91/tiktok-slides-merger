import { Button } from './Button'
import { Icon } from './Icon'

type ColumnsStepperProps = {
  columns: number
  max: number
  onChange: (columns: number) => void
}

export function ColumnsStepper({
  columns,
  max,
  onChange,
}: ColumnsStepperProps) {
  return (
    <div className="stepper">
      <Button
        aria-label="Decrease columns"
        disabled={columns <= 2}
        onClick={() => onChange(Math.max(2, columns - 1))}
      >
        <Icon name="minus" size={14} />
      </Button>
      <span style={{ textAlign: 'center' }}>{columns}</span>
      <Button
        aria-label="Increase columns"
        disabled={columns >= max}
        onClick={() => onChange(Math.min(max, columns + 1))}
      >
        <Icon name="plus" size={14} />
      </Button>
    </div>
  )
}
