import { Icon } from './Icon'

const REPOSITORY_URL = 'https://github.com/baky91/tiktok-slides-merger'

export function Footer() {
  return (
    <footer className="footer">
      <span>SlidesMerger is not affiliated with TikTok.</span>
      <a
        className="footer-link"
        href={REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="github" size={16} />
        <span>View on GitHub</span>
      </a>
    </footer>
  )
}
