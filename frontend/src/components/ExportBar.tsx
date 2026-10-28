import type { Format } from '../types'
import { Button } from './Button'
import { Icon } from './Icon'

type ExportBarProps = {
  imageCount: number
  format: Format
  exporting: boolean
  disabled: boolean
  onDownload: () => void
}

export function ExportBar({ imageCount, format, exporting, disabled, onDownload }: ExportBarProps) {
  return (
    <div className="export-bar">
      <div>
        <div className="export-label">Ready to export</div>
        <div className="export-copy">{imageCount} images · {format} · High quality</div>
      </div>
      <Button className="download-button" onClick={onDownload} disabled={disabled}>
        {exporting ? <><span className="spinner" /> Creating file…</> : <><Icon name="download" size={18} /> Download as {format}</>}
      </Button>
    </div>
  )
}
