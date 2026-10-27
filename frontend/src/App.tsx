import { useEffect, useState } from 'react'
import { ControlsPanel } from './components/ControlsPanel'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { PreviewPanel } from './components/PreviewPanel'
import { Toast } from './components/Toast'
import { Format, Layout, Status } from './types'

function App() {
  const [layout, setLayout] = useState<Layout>(Layout.Grid)
  const [format, setFormat] = useState<Format>(Format.PNG)
  const [columns, setColumns] = useState(2)
  const [spacing, setSpacing] = useState(12)
  const [url, setUrl] = useState('https://www.tiktok.com/@explore/video/7362850142')
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(false), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const fetchImages = () => {
    if (!url.includes('tiktok.com')) {
      setStatus(Status.Error)
      return
    }
    setStatus(Status.Loading)
    window.setTimeout(() => setStatus(Status.Ready), 1100)
  }

  const download = () => {
    setExporting(true)
    window.setTimeout(() => {
      const blob = new Blob(['SlidesMerger preview export'], { type: 'text/plain' })
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
          onUrlChange={setUrl}
          onClear={() => { setUrl(''); setStatus(Status.Idle) }}
          onFetch={fetchImages}
        />

        <section className="workspace">
          <ControlsPanel
            layout={layout}
            columns={columns}
            format={format}
            spacing={spacing}
            onLayoutChange={setLayout}
            onColumnsChange={setColumns}
            onFormatChange={setFormat}
            onSpacingChange={setSpacing}
          />

          <PreviewPanel
            layout={layout}
            columns={columns}
            spacing={spacing}
            format={format}
            status={status}
            exporting={exporting}
            onDownload={download}
          />
        </section>
      </main>

      {toast && <Toast />}
    </div>
  )
}

export default App
