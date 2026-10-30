import { useSettings } from '../contexts/SettingsProvider'
import { Button } from './Button'
import { Icon } from './Icon'

type ExportBarProps = {
  imageCount: number
  exporting: boolean
  disabled: boolean
  onDownload: () => void
}

export function ExportBar({
  imageCount,
  exporting,
  disabled,
  onDownload,
}: ExportBarProps) {
  const { format } = useSettings()

  return (
    <div className="export-bar">
      <div>
        <div className="export-label">Ready to export</div>
        <div className="export-copy">
          {imageCount} images · {format} · High quality
        </div>
      </div>
      <Button
        className="download-button"
        onClick={onDownload}
        disabled={disabled}
      >
        {exporting ? (
          <>
            <span className="spinner" /> Creating file…
          </>
        ) : (
          <>
            <Icon name="download" size={18} /> Download as {format}
          </>
        )}
      </Button>
    </div>
  )
}
