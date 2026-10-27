import { type Format, Layout, Status } from '../types'
import { ExportBar } from './ExportBar'
import { PreviewCanvas } from './PreviewCanvas'

type PreviewPanelProps = {
  images: string[]
  layout: Layout
  columns: number
  spacing: number
  format: Format
  status: Status
  exporting: boolean
  onDownload: () => void
}

export function PreviewPanel({ images, layout, columns, spacing, format, status, exporting, onDownload }: PreviewPanelProps) {
  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <div>
          <div className="section-kicker">Live preview</div>
          <div className="preview-title">Your merged carousel</div>
        </div>
        <div className="canvas-meta">
          <span>{images.length} images</span><i /><span>{layout === Layout.Horizontal ? '8640 × 1920' : '2160 × 2880'} px</span>
        </div>
      </div>

      <PreviewCanvas images={images} layout={layout} columns={columns} spacing={spacing} loading={status === Status.Loading} />

      <ExportBar format={format} exporting={exporting} disabled={exporting || status !== Status.Ready} onDownload={onDownload} />
    </div>
  )
}
