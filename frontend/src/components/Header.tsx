import { Button } from './Button'
import { Icon } from './Icon'

export function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><Icon name="spark" size={17} /></div>
        <span>SlidesMerger</span>
      </div>
      <div className="top-actions">
        <Button className="text-link">How it works</Button>
        <div className="status-pill"><span /> Free to use</div>
      </div>
    </header>
  )
}
