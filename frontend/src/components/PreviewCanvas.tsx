import { useMemo } from 'react'
import { photos } from '../data/photos'
import { Layout } from '../types'
import { Button } from './Button'
import { Icon } from './Icon'

type PreviewCanvasProps = {
  layout: Layout
  columns: number
  spacing: number
  loading: boolean
}

export function PreviewCanvas({ layout, columns, spacing, loading }: PreviewCanvasProps) {
  const canvasClass = useMemo(() => {
    if (layout === Layout.Vertical) return 'canvas-images vertical'
    if (layout === Layout.Horizontal) return 'canvas-images horizontal'
    return `canvas-images grid cols-${columns}`
  }, [layout, columns])

  return (
    <div className="preview-stage">
      {loading ? (
        <div className="loading-state"><span className="spinner dark" /><strong>Fetching images…</strong><small>Reading your TikTok carousel</small></div>
      ) : (
        <div className="paper">
          <div className={canvasClass} style={{ gap: `${Math.max(3, spacing / 2)}px` }}>
            {photos.map((photo, index) => (
              <div className="photo-card" key={photo}>
                <img src={photo} alt={`Mediterranean carousel image ${index + 1}`} />
                {index === 0 && <div className="photo-caption"><small>SUMMER NOTES</small><strong>A quiet escape<br />by the sea</strong><span>Swipe to explore</span></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="zoom-control">
        <Button aria-label="Zoom out"><Icon name="minus" size={14} /></Button><span>72%</span><Button aria-label="Zoom in"><Icon name="plus" size={14} /></Button>
      </div>
    </div>
  )
}
