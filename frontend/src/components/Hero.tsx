import { Status } from '../types'
import { Button } from './Button'
import { Icon } from './Icon'

type HeroProps = {
  url: string
  status: Status
  error: string
  onUrlChange: (url: string) => void
  onClear: () => void
  onFetch: () => void
}

export function Hero({
  url,
  status,
  error,
  onUrlChange,
  onClear,
  onFetch,
}: HeroProps) {
  return (
    <section className="hero">
      <div className="eyebrow">
        <Icon name="spark" size={14} /> TikTok carousel downloader
      </div>
      <div className="hero-title">
        Turn TikTok Carousels
        <br />
        into a Single File
      </div>
      <div className="hero-copy">
        Paste a TikTok carousel link, customize the layout, and export
        <br className="desktop-break" /> all images as JPEG or PDF.
      </div>
      <form
        className={`url-wrap ${status === Status.Error ? 'has-error' : ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          onFetch()
        }}
      >
        <div className="url-field">
          <Icon name="link" size={20} />
          <input
            aria-label="TikTok carousel URL"
            name="url-input"
            id="url-input"
            autoComplete="on"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="Paste your TikTok carousel URL…"
          />
          {url && (
            <Button
              className="clear-url"
              aria-label="Clear URL"
              title="Clear URL"
              onClick={onClear}
            >
              <Icon name="close" size={16} />
            </Button>
          )}
        </div>
        <Button
          type="submit"
          className="fetch-button"
          disabled={status === Status.Loading}
        >
          {status === Status.Loading ? (
            <>
              <span className="spinner" /> Fetching images…
            </>
          ) : (
            <>
              Fetch Images <Icon name="arrow" />
            </>
          )}
        </Button>
      </form>
      {status === Status.Error && <div className="field-error">{error}</div>}
    </section>
  )
}
