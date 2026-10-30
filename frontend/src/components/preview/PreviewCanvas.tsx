import { useCallback, useEffect, useRef, useState } from 'react'
import { Layout } from '../../types'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { useSettings } from '../../contexts/SettingsProvider'

type PreviewCanvasProps = {
  images: string[]
  // The carousel has slides, even if none of them is currently selected
  hasSlides: boolean
  loading: boolean
}

type Point = { x: number; y: number }
type View = Point & { scale: number }

const MIN_SCALE = 0.2
const MAX_SCALE = 4
const ZOOM_STEP = 1.25
const FIT_PADDING = 48

const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))

// Zooms around `point` (in stage coordinates) so that it stays fixed on screen
function zoomAt(view: View, point: Point, nextScale: number): View {
  const scale = clampScale(nextScale)
  const ratio = scale / view.scale
  return {
    scale,
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
  }
}

// Center and spread of the active pointers (one finger/mouse or a pinch)
function gesture(points: Point[]) {
  const [a, b = a] = points
  return {
    center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    distance: Math.hypot(a.x - b.x, a.y - b.y),
  }
}

export function PreviewCanvas({
  images,
  hasSlides,
  loading,
}: PreviewCanvasProps) {
  const { layout, columns, spacing, lineColor } = useSettings()

  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 })
  const stageRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, Point>())
  // Once the user moves or zooms, stop auto-fitting the content
  const interacted = useRef(false)

  const columnCount =
    layout === Layout.Vertical
      ? 1
      : layout === Layout.Horizontal
        ? images.length
        : Math.min(columns, images.length)

  const fit = useCallback(() => {
    const stage = stageRef.current
    const paper = paperRef.current
    if (!stage || !paper) return
    const scale = clampScale(
      Math.min(
        1,
        (stage.clientWidth - FIT_PADDING) / paper.offsetWidth,
        (stage.clientHeight - FIT_PADDING) / paper.offsetHeight
      )
    )
    // Use the paper's real untransformed position: a paper taller than the
    // stage overflows downward instead of staying centered
    const paperCenter = {
      x: paper.offsetLeft + paper.offsetWidth / 2,
      y: paper.offsetTop + paper.offsetHeight / 2,
    }
    setView({
      scale,
      x: stage.clientWidth / 2 - paperCenter.x * scale,
      y: stage.clientHeight / 2 - paperCenter.y * scale,
    })
  }, [])

  // Re-fit whenever the content changes size (new images, layout, image loading…)
  useEffect(() => {
    interacted.current = false
    const stage = stageRef.current
    const paper = paperRef.current
    if (!stage || !paper) return
    const observer = new ResizeObserver(() => {
      if (!interacted.current) fit()
    })
    observer.observe(stage)
    observer.observe(paper)
    return () => observer.disconnect()
  }, [fit, images, layout, columns, spacing, loading])

  // Scrolling over the stage (mouse wheel or trackpad pinch) zooms instead of scrolling the page
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (event: WheelEvent) => {
      if (!stage.classList.contains('navigable')) return
      event.preventDefault()
      interacted.current = true
      const rect = stage.getBoundingClientRect()
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      setView((current) =>
        zoomAt(current, point, current.scale * Math.exp(-event.deltaY * 0.002))
      )
    }
    // React registers wheel listeners as passive, which forbids preventDefault
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [])

  const toStagePoint = (event: React.PointerEvent): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as Element).closest('button'))
      return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, toStagePoint(event))
    interacted.current = true
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    const previous = gesture([...pointers.current.values()])
    pointers.current.set(event.pointerId, toStagePoint(event))
    const next = gesture([...pointers.current.values()])

    setView((current) => {
      const zoomed =
        pointers.current.size > 1 && previous.distance > 0
          ? zoomAt(
              current,
              previous.center,
              current.scale * (next.distance / previous.distance)
            )
          : current
      return {
        ...zoomed,
        x: zoomed.x + next.center.x - previous.center.x,
        y: zoomed.y + next.center.y - previous.center.y,
      }
    })
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
  }

  const zoomBy = (factor: number) => {
    const stage = stageRef.current
    if (!stage) return
    interacted.current = true
    const center = { x: stage.clientWidth / 2, y: stage.clientHeight / 2 }
    setView((current) => zoomAt(current, center, current.scale * factor))
  }

  const resetView = () => {
    interacted.current = false
    fit()
  }

  const hasImages = !loading && images.length > 0

  return (
    <div
      ref={stageRef}
      className={`preview-stage ${hasImages ? 'navigable' : ''}`}
      onPointerDown={hasImages ? onPointerDown : undefined}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {loading ? (
        <div className="loading-state">
          <span className="spinner dark" />
          <strong>Fetching images…</strong>
          <small>Reading your TikTok carousel</small>
        </div>
      ) : images.length === 0 ? (
        hasSlides ? (
          <div className="loading-state">
            <Icon name="image" size={22} />
            <strong>No slides selected</strong>
            <small>Select at least one slide to see the preview</small>
          </div>
        ) : (
          <div className="loading-state">
            <Icon name="image" size={22} />
            <strong>No images yet</strong>
            <small>Paste a TikTok carousel link to see the preview</small>
          </div>
        )
      ) : (
        <div
          className="preview-viewport"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <div className="paper" ref={paperRef}>
            <div
              className="canvas-images"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, var(--cell-width))`,
                // Same rule as the export: a percentage of the image width
                gap: `calc(var(--cell-width) * ${spacing / 100})`,
                background: lineColor,
              }}
            >
              {images.map((image, index) => (
                <div className="photo-card" key={image}>
                  {/* TikTok's CDN rejects requests carrying a foreign Referer */}
                  <img
                    src={image}
                    alt={`Carousel image ${index + 1}`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {hasImages && (
        <>
          <div className="preview-hint">
            <span className="hint-pointer">Drag to move · Scroll to zoom</span>
            <span className="hint-touch">Drag to move · Pinch to zoom</span>
          </div>
          <div className="zoom-control">
            <Button aria-label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)}>
              <Icon name="minus" size={14} />
            </Button>
            <Button
              className="zoom-value"
              title="Fit to screen"
              onClick={resetView}
            >
              {Math.round(view.scale * 100)}%
            </Button>
            <Button aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)}>
              <Icon name="plus" size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
