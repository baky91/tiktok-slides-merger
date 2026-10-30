import { useSettings } from '../../contexts/SettingsProvider'
import { Layout, Status } from '../../types'
import { ExportBar } from '../ExportBar'
import { ImagePicker } from './ImagePicker'
import { PreviewCanvas } from './PreviewCanvas'

type PreviewPanelProps = {
  images: string[]
  activeImages: string[]
  status: Status
  exporting: boolean
  onToggleImage: (image: string) => void
  onToggleAllImages: () => void
  onDownload: () => void
}

export function PreviewPanel({
  images,
  activeImages,
  status,
  exporting,
  onToggleImage,
  onToggleAllImages,
  onDownload,
}: PreviewPanelProps) {
  const { layout } = useSettings()

  const loading = status === Status.Loading

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <div>
          <div className="section-kicker">Live preview</div>
          <div className="preview-title">Your merged carousel</div>
        </div>
        <div className="canvas-meta">
          <span>{activeImages.length} images</span>
          <i />
          <span>
            {layout === Layout.Horizontal ? '8640 × 1920' : '2160 × 2880'} px
          </span>
        </div>
      </div>

      {!loading && images.length > 0 && (
        <ImagePicker
          images={images}
          activeImages={activeImages}
          onToggle={onToggleImage}
          onToggleAll={onToggleAllImages}
        />
      )}

      <PreviewCanvas
        images={activeImages}
        hasSlides={images.length > 0}
        loading={loading}
      />

      <ExportBar
        imageCount={activeImages.length}
        exporting={exporting}
        disabled={
          exporting || status !== Status.Ready || activeImages.length === 0
        }
        onDownload={onDownload}
      />
    </div>
  )
}
