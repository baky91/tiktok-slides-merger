import { Status } from '../types'
import { Button } from './Button'
import { Icon } from './Icon'

type HeroProps = {
  url: string
  status: Status
  onUrlChange: (url: string) => void
  onClear: () => void
  onFetch: () => void
}

export function Hero({ url, status, onUrlChange, onClear, onFetch }: HeroProps) {
  return (
    <section className="hero">
      <div className="eyebrow"><Icon name="spark" size={14} /> TikTok carousel downloader</div>
      <div className="hero-title">Turn TikTok Carousels<br />into a Single File</div>
      <div className="hero-copy">Paste a TikTok carousel link, customize the layout, and export<br className="desktop-break" /> all images as PNG or PDF.</div>
      <div className={`url-wrap ${status === Status.Error ? 'has-error' : ''}`}>
        <div className="url-field">
          <Icon name="link" size={20} />
          <input aria-label="TikTok carousel URL" value={url} onChange={(event) => onUrlChange(event.target.value)} placeholder="Paste your TikTok carousel URL…" />
          {url && (
            <Button className="clear-url" aria-label="Clear URL" title="Clear URL" onClick={onClear}>
              <Icon name="close" size={16} />
            </Button>
          )}
        </div>
        <Button className="fetch-button" onClick={onFetch} disabled={status === Status.Loading}>
          {status === Status.Loading ? <><span className="spinner" /> Fetching images…</> : <>Fetch Images <Icon name="arrow" /></>}
        </Button>
      </div>
      {status === Status.Error && <div className="field-error">Enter a valid TikTok carousel URL to continue.</div>}
    </section>
  )
}
