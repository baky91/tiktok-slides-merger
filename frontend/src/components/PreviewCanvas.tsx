import { useMemo } from 'react'
import { Layout } from '../types'
import { Button } from './Button'
import { Icon } from './Icon'

type PreviewCanvasProps = {
  images: string[]
  layout: Layout
  columns: number
  spacing: number
  loading: boolean
}

export function PreviewCanvas({ images, layout, columns, spacing, loading }: PreviewCanvasProps) {
  const canvasClass = useMemo(() => {
    if (layout === Layout.Vertical) return 'canvas-images vertical'
    if (layout === Layout.Horizontal) return 'canvas-images horizontal'
    return `canvas-images grid cols-${columns}`
  }, [layout, columns])

  return (
    <div className="preview-stage">
      {loading ? (
        <div className="loading-state"><span className="spinner dark" /><strong>Fetching images…</strong><small>Reading your TikTok carousel</small></div>
      ) : images.length === 0 ? (
        <div className="loading-state"><Icon name="image" size={22} /><strong>No images yet</strong><small>Paste a TikTok carousel link to see the preview</small></div>
      ) : (
        <div className="paper">
          <div className={canvasClass} style={{ gap: `${Math.max(3, spacing / 2)}px` }}>
            {images.map((image, index) => (
              <div className="photo-card" key={image}>
                {/* TikTok's CDN rejects requests carrying a foreign Referer */}
                <img src={image} alt={`Carousel image ${index + 1}`} referrerPolicy="no-referrer" />
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
