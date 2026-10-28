import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchTiktokImages } from './api'
import { ControlsPanel } from './components/ControlsPanel'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { PreviewPanel } from './components/PreviewPanel'
import { QuickSettings } from './components/QuickSettings'
import { Toast } from './components/Toast'
import { Format, Layout, Status } from './types'

function App() {
  const [layout, setLayout] = useState<Layout>(Layout.Grid)
  const [format, setFormat] = useState<Format>(Format.PNG)
  const [columns, setColumns] = useState(2)
  const [spacing, setSpacing] = useState(12)
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>(Status.Idle)
  const [images, setImages] = useState<string[]>([])
  const [excludedImages, setExcludedImages] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState(false)
  const quickSettingsRef = useRef<HTMLDivElement>(null)

  const activeImages = useMemo(() => images.filter((image) => !excludedImages.has(image)), [images, excludedImages])
  // A grid can have as many columns as there are selected images
  const maxColumns = Math.max(2, activeImages.length)
  const gridColumns = Math.min(columns, maxColumns)

  const toggleImage = (image: string) => {
    setExcludedImages((current) => {
      const next = new Set(current)
      if (next.has(image)) next.delete(image)
      else next.add(image)
      return next
    })
  }

  const toggleAllImages = () => {
    setExcludedImages((current) => (current.size === 0 ? new Set(images) : new Set()))
  }

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(false), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const fetchImages = async () => {
    if (!url.includes('tiktok.com')) {
      setError('Enter a valid TikTok carousel URL to continue.')
      setStatus(Status.Error)
      return
    }
    setStatus(Status.Loading)
    // On mobile the preview sits below the controls: bring it into view
    if (window.matchMedia('(max-width: 900px)').matches) {
      quickSettingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    try {
      const carousel = await fetchTiktokImages(url)
      setImages(carousel.images)
      setExcludedImages(new Set())
      setStatus(Status.Ready)
    } catch (err) {
      setImages([])
      setError(err instanceof Error ? err.message : String(err))
      setStatus(Status.Error)
    }
  }

  const download = () => {
    setExporting(true)
    window.setTimeout(() => {
      const blob = new Blob(['SlidesMerger preview export'], {
        type: 'text/plain',
      })
      const href = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = href
      anchor.download = `slidesmerger-export.${format.toLowerCase()}.txt`
      anchor.click()
      URL.revokeObjectURL(href)
      setExporting(false)
      setToast(true)
    }, 900)
  }

  return (
    <div className="app-shell">
      <Header />

      <main>
        <Hero
          url={url}
          status={status}
          error={error}
          onUrlChange={setUrl}
          onClear={() => {
            setUrl('')
            setStatus(Status.Idle)
          }}
          onFetch={fetchImages}
        />

        <section className="workspace">
          <ControlsPanel
            imageCount={activeImages.length}
            layout={layout}
            columns={gridColumns}
            maxColumns={maxColumns}
            format={format}
            spacing={spacing}
            onLayoutChange={setLayout}
            onColumnsChange={setColumns}
            onFormatChange={setFormat}
            onSpacingChange={setSpacing}
          />

          <QuickSettings
            ref={quickSettingsRef}
            layout={layout}
            columns={gridColumns}
            maxColumns={maxColumns}
            format={format}
            onLayoutChange={setLayout}
            onColumnsChange={setColumns}
            onFormatChange={setFormat}
          />

          <PreviewPanel
            images={images}
            activeImages={activeImages}
            layout={layout}
            columns={gridColumns}
            spacing={spacing}
            format={format}
            status={status}
            exporting={exporting}
            onToggleImage={toggleImage}
            onToggleAllImages={toggleAllImages}
            onDownload={download}
          />
        </section>
      </main>

      {toast && <Toast />}
    </div>
  )
}

export default App
